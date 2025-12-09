import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMapPin, faDollarSign, faUsers, faBed, faBath, faStar, faImage, faCheck } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../api/client';
import './add-cabin-modal.css';

interface AddCabinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCabinCreated: () => void;
}

export default function AddCabinModal({ isOpen, onClose, onCabinCreated }: AddCabinModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    images: '',
  });

  const [imageList, setImageList] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && !imageList.includes(newImageUrl.trim())) {
      setImageList([...imageList, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageList(imageList.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setError('');
      setLoading(true);

      // Crear FormData con los archivos
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      // Enviar al backend para procesar y convertir a WebP
      const response = await apiClient.post('/upload/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Agregar las URLs retornadas a la lista
      if (response.data.imageUrls && Array.isArray(response.data.imageUrls)) {
        setImageList((prevList) => [
          ...prevList,
          ...response.data.imageUrls.filter((img: string) => !prevList.includes(img)),
        ]);
      }

      // Resetear el input
      e.target.value = '';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al subir imágenes');
      console.error('Error en upload:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post(
        '/admin/cabins',
        {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price: parseFloat(formData.price),
          capacity: parseInt(formData.capacity),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
          images: imageList,
        }
      );

      setFormData({
        title: '',
        description: '',
        location: '',
        price: '',
        capacity: '',
        bedrooms: '',
        bathrooms: '',
        images: '',
      });
      setImageList([]);
      setNewImageUrl('');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onCabinCreated();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la cabaña');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-list-modal-overlay" onClick={onClose}>
      <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-list-modal-header">
          <h2 className="admin-list-modal-title">🏠 Agregar Nueva Cabaña</h2>
          <button className="admin-list-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          {error && <div className="alert alert-danger">{error}</div>}
          
          {success && (
            <div className="cabin-modal-success">
              <FontAwesomeIcon icon={faCheck} />
              <p>¡Cabaña creada exitosamente!</p>
            </div>
          )}

          {/* Información Básica */}
          <div className="admin-form-section">
            <h3 className="admin-form-section-title">Información Básica</h3>
            <div className="admin-form-row col-md-1">
              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faHome} /> Título</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="ej: Cabaña con vista al lago"
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-form-row col-md-1">
              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faMapPin} /> Ubicación</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="ej: San Martín de los Andes"
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-form-row col-md-1">
              <div className="admin-form-group">
                <label>📝 Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe la cabaña, comodidades, características..."
                  className="admin-form-control"
                />
              </div>
            </div>
          </div>

          {/* Detalles y Precios */}
          <div className="admin-form-section">
            <h3 className="admin-form-section-title">Detalles y Precios</h3>
            <div className="admin-form-row col-md-1">
              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faDollarSign} /> Precio por Noche</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  placeholder="150.00"
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-form-row col-md-1">
              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faUsers} /> Capacidad (personas)</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  placeholder="4"
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-form-row col-md-1">
              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faBed} /> Dormitorios</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="2"
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-form-row col-md-1">
              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faBath} /> Baños</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="1"
                  className="admin-form-control"
                />
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="admin-form-section">
            <h3 className="admin-form-section-title">📸 Imágenes</h3>

            <div className="admin-form-group">
              <label><FontAwesomeIcon icon={faImage} /> Imágenes</label>
              <div className="image-input-group">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com/imagen.jpg"
                  className="image-url-input"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!newImageUrl.trim() || loading}
                  className="btn-add-image"
                >
                  + Agregar URL
                </button>
              </div>

              <div className="image-upload-group">
                <label htmlFor="file-upload" className="btn-upload-file">
                  📁 Subir desde PC
                </label>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {imageList.length > 0 && (
                <div className="image-list">
                  {imageList.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="btn-remove-image"
                        title="Eliminar imagen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="admin-list-modal-footer">
            <button
              type="button"
              className="admin-btn secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="admin-btn primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Cabaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
