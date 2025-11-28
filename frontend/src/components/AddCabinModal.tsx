import { useState } from 'react';
import axios from 'axios';
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Agregar Nueva Cabaña</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Información Básica */}
          <div className="form-section">
            <h3>Información Básica</h3>
            <div className="form-row col-md-4">
              <div className="form-group">
                <label htmlFor="title">Título</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="ej: Cabaña con vista al lago"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Ubicación</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="ej: San Martín de los Andes"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe la cabaña, comodidades, características..."
                />
              </div>
            </div>
          </div>

          {/* Detalles y Precios */}
          <div className="form-section">
            <h3>Detalles y Precios</h3>
            <div className="form-row col-md-4">
              <div className="form-group">
                <label htmlFor="price">Precio por Noche ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  placeholder="150.00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="capacity">Capacidad (personas)</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  placeholder="4"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bedrooms">Dormitorios</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="2"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bathrooms">Baños</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Comodidades e Imágenes */}
          <div className="form-section">
            <h3>Comodidades e Imágenes</h3>
            <div className="form-row col-md-4">
              <div className="form-group">
                <label htmlFor="amenities">Comodidades</label>
                <input
                  type="text"
                  id="amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="WiFi, TV, Cocina, Piscina, Aire acondicionado"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Imágenes</label>
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

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
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
