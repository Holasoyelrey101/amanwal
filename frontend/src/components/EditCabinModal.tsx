import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
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

const API_URL = 'http://localhost:3000/api';

export const EditCabinModal: React.FC<EditCabinModalProps> = ({
  isOpen,
  onClose,
  onCabinUpdated,
  cabin,
}) => {
  const { token } = useAuth();
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

  const headers = { Authorization: `Bearer ${token}` };

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

      await axios.put(`${API_URL}/admin/cabins/${cabin?.id}`, updateData, { headers });
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Editar Cabaña</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Información Básica */}
          <div className="form-section">
            <h3>Información Básica</h3>
            <div className="form-row col-md-2">
              <div className="form-group">
                <label htmlFor="title">Título</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
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
                />
              </div>
            </div>
            <div className="form-row col-md-1">
              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
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
                  required
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
                  required
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
                  placeholder="WiFi, TV, Cocina, etc..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Imágenes</label>
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
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Cabaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
