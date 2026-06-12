import React, { useState, useEffect } from 'react';
import { statesAndDistricts, defaultCityCoords, stateCapitals } from '../services/locationData';

/**
 * LocationSelector – provides state and city dropdowns.
 * Props: stateValue, cityValue, onStateChange, onCityChange
 */
const LocationSelector = ({ stateValue, cityValue, onStateChange, onCityChange }) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  // Resolve coordinates for potential backend use (no map displayed)
  useEffect(() => {
    if (!cityValue) {
      setCoords(null);
      return;
    }
    const fetchCoords = async () => {
      if (defaultCityCoords[cityValue]) {
        setCoords({ lat: defaultCityCoords[cityValue][0], lng: defaultCityCoords[cityValue][1] });
        return;
      }
      if (stateValue && stateCapitals[stateValue]) {
        setCoords({ lat: stateCapitals[stateValue][0], lng: stateCapitals[stateValue][1] });
        return;
      }
      try {
        setLoading(true);
        const query = encodeURIComponent(`${cityValue}, ${stateValue}, India`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data && data[0]) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch (e) {
        console.warn('Geocode error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCoords();
  }, [cityValue, stateValue]);

  const stateOptions = Object.keys(statesAndDistricts);
  const cityOptions = stateValue ? statesAndDistricts[stateValue] || [] : [];

  return (
    <div className="location-selector" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <select className="form-control" value={stateValue || ''} onChange={e => onStateChange(e.target.value)}>
          <option value="">Select State / UT</option>
          {stateOptions.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
        <select
          className="form-control"
          value={cityValue || ''}
          onChange={e => onCityChange(e.target.value)}
          disabled={!stateValue}
        >
          <option value="">Select District / City</option>
          {cityOptions.map(ct => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LocationSelector;
