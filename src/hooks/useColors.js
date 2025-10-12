import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

const useColors = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColors = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.buscarCores();
        setColors(data);
      } catch (err) {
        setError('Erro ao carregar cores');
        setColors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchColors();
  }, []);

  return { colors, loading, error };
};

export default useColors; 