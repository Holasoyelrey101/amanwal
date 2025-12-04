import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMapPin, faDollarSign, faUsers, faBed, faBath, faStar, faImage } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../api/client';
import './add-cabin-modal.css';

interface EditCabinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCabinUpdated: () => void;
  cabin: {
    id: string;
    title: string;
    description: string;
    location: string;
    price: number;
    capacity: number;
    bedrooms: number;
    bathrooms: number;
    amenities: string;
    images: string[];
  } | null;
}

export const EditCabinModal: React.FC<EditCabinModalProps> = ({
  isOpen,
  onClose,
  onCabinUpdated,
  cabin,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
  });
  const [imageList, setImageList] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cabin && isOpen) {
      setFormData({
        title: cabin.title || '',
        description: cabin.description || '',
        location: cabin.location || '',
        price: cabin.price?.toString() || '',
        capacity: cabin.capacity?.toString() || '',
        bedrooms: cabin.bedrooms?.toString() || '',
        bathrooms: cabin.bathrooms?.toString() || '',
        amenities: cabin.amenities || '',
      });
      
      // Parsear las imágenes correctamente
      let parsedImages: string[] = [];
      if (typeof cabin.images === 'string') {
        try {
          parsedImages = JSON.parse(cabin.images);
        } catch (e) {
          parsedImages = [];
        }
      } else if (Array.isArray(cabin.images)) {
        parsedImages = cabin.images;
      }
      setImageList(parsedImages);
      setNewImageUrl('');
    }
  }, [cabin, isOpen]);

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
      console.error('Error en upload:', err);
      alert(err.response?.data?.error || 'Error al subir imágenes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        images: imageList,
      };

      await apiClient.put(`/admin/cabins/${cabin?.id}`, updateData);
      alert('Cabaña actualizada exitosamente');
      onCabinUpdated();
      onClose();
    } catch (error) {
      console.error('Error al actualizar cabaña:', error);
      alert('Error al actualizar cabaña');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !cabin) return null;

  return (
    <div className="admin-list-modal-overlay" onClick={onClose}>
      <div className="admin-list-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-list-modal-header">
          <h2 className="admin-list-modal-title">🏠 Editar Cabaña</h2>
          <button className="admin-list-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
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
                  className="admin-form-control"
                  required
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
                  className="admin-form-control"
                  required
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
                  rows={4}
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
                  className="admin-form-control"
                  required
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
                  className="admin-form-control"
                  required
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
                  className="admin-form-control"
                  required
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
                  className="admin-form-control"
                  required
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
                  className="admin-form-control"
                  placeholder="WiFi, TV, Cocina, etc..."
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label><FontAwesomeIcon icon={faImage} /> Imágenes</label>
              <div className="image-input-group">
                <input
                  type="url"
                  className="image-url-input"
                  placeholder="URL de la imagen..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button type="button" className="btn-add-image" onClick={handleAddImage}>
                  + Agregar URL
                </button>
              </div>

              <div className="image-upload-group">
                <label htmlFor="file-upload-edit" className="btn-upload-file">
                  📁 Subir desde PC
                </label>
                <input
                  type="file"
                  id="file-upload-edit"
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
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="admin-list-modal-footer">
            <button type="button" className="admin-btn secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="admin-btn primary" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Cabaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
