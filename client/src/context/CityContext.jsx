import { createContext, useContext, useState, useEffect } from 'react';
import { theaterAPI } from '../services/api';

const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('cinebook_city') || '');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    theaterAPI.getCities().then(r => setCities(r.data)).catch(() => {});
  }, []);

  const changeCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('cinebook_city', city);
  };

  return (
    <CityContext.Provider value={{ selectedCity, changeCity, cities }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => useContext(CityContext);
