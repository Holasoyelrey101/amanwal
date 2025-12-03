import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMapPin, faDollarSign, faUsers, faBed, faBath, faStar, faImage } from '@fortawesome/free-solid-svg-icons';
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
    amenities: '',
    images: '',
  });

  const [imageList, setImageList] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileReadPromises: Promise<string>[] = [];

      Array.from(files).forEach((file) => {
        const promise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            resolve(result);
          };
          reader.readAsDataURL(file);
        });
        fileReadPromises.push(promise);
      });

      Promise.all(fileReadPromises).then((results) => {
        setImageList((prevList) => [
          ...prevList,
          ...results.filter((img) => !prevList.includes(img)),
        ]);
      });

      // Resetear el input para permitir seleccionar el mismo archivo de nuevo
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amenitiesArray = formData.amenities
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '');

      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:3000/api/admin/cabins',
        {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price: parseFloat(formData.price),
          capacity: parseInt(formData.capacity),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
          amenities: amenitiesArray,
          images: imageList,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        amenities: '',
        images: '',
      });
      setImageList([]);
      setNewImageUrl('');

      onCabinCreated();
      onClose();
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

          {/* Comodidades e Imágenes */}
          <div className="admin-form-section">
            <h3 className="admin-form-section-title">Comodidades e Imágenes</h3>
            <div className="admin-form-row col-md-1">
              <div className="admin-form-group">
                <label><FontAwesomeIcon icon={faStar} /> Comodidades</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="WiFi, TV, Cocina, Piscina, Aire acondicionado"
                  className="admin-form-control"
                />
              </div>
            </div>

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
