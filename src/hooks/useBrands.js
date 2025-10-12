import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

const useBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.buscarMarcas();
        setBrands(data);
      } catch (err) {
        setError('Erro ao carregar marcas');
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return { brands, loading, error };
};

export default useBrands; 