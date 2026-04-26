import Theater from '../models/Theater.js';

export const DEMO_THEATERS = [
  // Mumbai - 5 theaters
  { _id: 'm1', name: 'PVR Juhu', city: 'Mumbai', address: 'Juhu Tara Road, Juhu', state: 'Maharashtra', pincode: '400049', totalSeats: 220, screens: 4, amenities: ['IMAX', 'Dolby Atmos', '4DX', 'Recliner'], isActive: true },
  { _id: 'm2', name: 'INOX Nariman Point', city: 'Mumbai', address: 'Marine Lines, Nariman Point', state: 'Maharashtra', pincode: '400021', totalSeats: 180, screens: 3, amenities: ['3D', 'Dolby Atmos', 'Gold Class'], isActive: true },
  { _id: 'm3', name: 'Cinepolis Andheri', city: 'Mumbai', address: 'Infiniti Mall, Andheri West', state: 'Maharashtra', pincode: '400058', totalSeats: 280, screens: 5, amenities: ['IMAX', '4DX', 'Recliner', 'Food Court'], isActive: true },
  { _id: 'm4', name: 'PVR Logitech', city: 'Mumbai', address: 'Logitech Metro, Ghatkopar', state: 'Maharashtra', pincode: '400086', totalSeats: 150, screens: 2, amenities: ['Dolby Atmos', '3D'], isActive: true },
  { _id: 'm5', name: 'Eros Cinemas', city: 'Mumbai', address: 'Eros Cinema, Ram Gopal Vaidya Marg', state: 'Maharashtra', pincode: '400053', totalSeats: 120, screens: 2, amenities: ['3D'], isActive: true },
  
  // Delhi - 5 theaters
  { _id: 'd1', name: 'PVR Select Citywalk', city: 'Delhi', address: 'Select Citywalk Mall, Saket', state: 'Delhi', pincode: '110017', totalSeats: 200, screens: 4, amenities: ['IMAX', 'Dolby Atmos', 'Recliner'], isActive: true },
  { _id: 'd2', name: 'INOX Rajiv Chowk', city: 'Delhi', address: 'Inner Circle, Connaught Place', state: 'Delhi', pincode: '110001', totalSeats: 160, screens: 3, amenities: ['3D', 'Dolby Atmos', 'Gold Class'], isActive: true },
  { _id: 'd3', name: 'Cinepolis DLF Promenade', city: 'Delhi', address: 'DLF Promenade, Vasant Kunj', state: 'Delhi', pincode: '110070', totalSeats: 240, screens: 5, amenities: ['4DX', 'IMAX', 'Recliner'], isActive: true },
  { _id: 'd4', name: 'PVR Pacific', city: 'Delhi', address: 'Pacific Mall, Janakpuri', state: 'Delhi', pincode: '110058', totalSeats: 180, screens: 3, amenities: ['Dolby Atmos', '3D'], isActive: true },
  { _id: 'd5', name: 'Gurudev Cinemas', city: 'Delhi', address: 'Rajouri Garden', state: 'Delhi', pincode: '110027', totalSeats: 140, screens: 2, amenities: ['3D'], isActive: true },
  
  // Bangalore - 5 theaters
  { _id: 'b1', name: 'PVR Forum Koramangala', city: 'Bangalore', address: 'Forum Mall, Koramangala', state: 'Karnataka', pincode: '560095', totalSeats: 220, screens: 4, amenities: ['IMAX', 'Dolby Atmos', 'Recliner'], isActive: true },
  { _id: 'b2', name: 'INOX Garuda Mall', city: 'Bangalore', address: 'Magrath Road, Ashok Nagar', state: 'Karnataka', pincode: '560025', totalSeats: 180, screens: 3, amenities: ['3D', 'Dolby Atmos', 'Gold Class'], isActive: true },
  { _id: 'b3', name: 'Cinepolis Elements', city: 'Bangalore', address: 'Elements Mall, Rajajinagar', state: 'Karnataka', pincode: '560010', totalSeats: 200, screens: 4, amenities: ['4DX', 'IMAX', 'Recliner'], isActive: true },
  { _id: 'b4', name: 'PVR Orion', city: 'Bangalore', address: 'Orion Mall, Raj West', state: 'Karnataka', pincode: '560055', totalSeats: 160, screens: 3, amenities: ['Dolby Atmos', '3D'], isActive: true },
  { _id: 'b5', name: 'Gopalan Cinemas', city: 'Bangalore', address: 'Gopalan Grand Mall, Mysore Road', state: 'Karnataka', pincode: '560018', totalSeats: 150, screens: 2, amenities: ['3D'], isActive: true },
  
  // Hyderabad - 4 theaters
  { _id: 'h1', name: 'PVR GVK One', city: 'Hyderabad', address: 'GVK One Mall, Banjara Hills', state: 'Telangana', pincode: '500034', totalSeats: 200, screens: 4, amenities: ['IMAX', 'Dolby Atmos', 'Recliner'], isActive: true },
  { _id: 'h2', name: 'Cinepolis Manjeera', city: 'Hyderabad', address: 'Manjeera Mall, Kukatpally', state: 'Telangana', pincode: '500072', totalSeats: 260, screens: 5, amenities: ['4DX', 'IMAX', 'Recliner'], isActive: true },
  { _id: 'h3', name: 'INOX Asian', city: 'Hyderabad', address: 'Gulab House, Abids', state: 'Telangana', pincode: '500001', totalSeats: 140, screens: 2, amenities: ['Dolby Atmos', '3D'], isActive: true },
  { _id: 'h4', name: 'PVR Next', city: 'Hyderabad', address: 'Next Galleria, Panjagutta', state: 'Telangana', pincode: '500082', totalSeats: 180, screens: 3, amenities: ['4DX', 'Recliner'], isActive: true },
  
  // Chennai - 4 theaters
  { _id: 'c1', name: 'PVR SPI Palazzo', city: 'Chennai', address: 'VR Chennai, Ambattur', state: 'Tamil Nadu', pincode: '600053', totalSeats: 220, screens: 4, amenities: ['IMAX', 'Dolby Atmos', 'Recliner'], isActive: true },
  { _id: 'c2', name: 'AGS Cinemas', city: 'Chennai', address: '10th Avenue, Ashok Nagar', state: 'Tamil Nadu', pincode: '600083', totalSeats: 160, screens: 3, amenities: ['3D', 'Dolby Atmos', 'Gold Class'], isActive: true },
  { _id: 'c3', name: 'INOX Express', city: 'Chennai', address: 'Express Avenue, Royapettah', state: 'Tamil Nadu', pincode: '600014', totalSeats: 180, screens: 3, amenities: ['4DX', 'Recliner'], isActive: true },
  { _id: 'c4', name: 'Ega Cinemas', city: 'Chennai', address: 'Ega Theater, Kilpauk', state: 'Tamil Nadu', pincode: '600010', totalSeats: 120, screens: 2, amenities: ['3D'], isActive: true },
  
  // Pune - 4 theaters
  { _id: 'p1', name: 'PVR Phoenix Pune', city: 'Pune', address: 'Phoenix Marketcity, Viman Nagar', state: 'Maharashtra', pincode: '411014', totalSeats: 260, screens: 5, amenities: ['IMAX', '4DX', 'Recliner'], isActive: true },
  { _id: 'p2', name: 'INOX Inorbit', city: 'Pune', address: 'Inorbit Mall, Wakad', state: 'Maharashtra', pincode: '411057', totalSeats: 180, screens: 3, amenities: ['Dolby Atmos', '3D', 'Gold Class'], isActive: true },
  { _id: 'p3', name: 'Cinepolis Se Pegasus', city: 'Pune', address: 'Se Pegasus Mall, Kharadi', state: 'Maharashtra', pincode: '411014', totalSeats: 200, screens: 4, amenities: ['4DX', 'Recliner'], isActive: true },
  { _id: 'p4', name: 'E-Square Cinemas', city: 'Pune', address: 'Royal Hunt, Hadapsar', state: 'Maharashtra', pincode: '411028', totalSeats: 140, screens: 2, amenities: ['Dolby Atmos'], isActive: true },
  
  // Kolkata - 3 theaters
  { _id: 'k1', name: 'INOX South City', city: 'Kolkata', address: 'South City Mall, Prince Anwar Shah Rd', state: 'West Bengal', pincode: '700068', totalSeats: 200, screens: 4, amenities: ['IMAX', 'Dolby Atmos', 'Recliner'], isActive: true },
  { _id: 'k2', name: 'Cinepolis Acropolis', city: 'Kolkata', address: 'Acropolis Mall, Kasba', state: 'West Bengal', pincode: '700107', totalSeats: 160, screens: 3, amenities: ['3D', 'Gold Class'], isActive: true },
  { _id: 'k3', name: 'PVR Esplanade', city: 'Kolkata', address: 'Esplanade Mall', state: 'West Bengal', pincode: '700069', totalSeats: 180, screens: 3, amenities: ['4DX', 'Dolby Atmos'], isActive: true },

  // Additional cities
  // Ahmedabad
  { _id: 'a1', name: 'PVR Ahmedabad', city: 'Ahmedabad', address: 'Alpha One Mall, Navrangpura', state: 'Gujarat', pincode: '380009', totalSeats: 180, screens: 3, amenities: ['IMAX', 'Dolby Atmos'], isActive: true },
  { _id: 'a2', name: 'INOX City Pulse', city: 'Ahmedabad', address: 'City Pulse Mall, SG Highway', state: 'Gujarat', pincode: '380054', totalSeats: 140, screens: 2, amenities: ['3D', 'Recliner'], isActive: true },
  
  // Jaipur
  { _id: 'j1', name: 'PVR Jaipur', city: 'Jaipur', address: 'GT Central, Malviya Nagar', state: 'Rajasthan', pincode: '302017', totalSeats: 200, screens: 4, amenities: ['IMAX', 'Dolby Atmos'], isActive: true },
  { _id: 'j2', name: 'INOX Pink Square', city: 'Jaipur', address: 'Pink Square Mall, Khatipura', state: 'Rajasthan', pincode: '302012', totalSeats: 160, screens: 3, amenities: ['3D', 'Gold Class'], isActive: true },
  
  // Chandigarh
  { _id: 'ch1', name: 'PVR Chandigarh', city: 'Chandigarh', address: 'Elante Mall, Industrial Area', state: 'Punjab', pincode: '160002', totalSeats: 220, screens: 4, amenities: ['IMAX', 'Dolby Atmos', 'Recliner'], isActive: true },
  { _id: 'ch2', name: 'INOX City Beat', city: 'Chandigarh', address: 'City Beat Mall, Sector 9', state: 'Punjab', pincode: '160009', totalSeats: 140, screens: 2, amenities: ['3D'], isActive: true },
  
  // Lucknow
  { _id: 'l1', name: 'PVR Lucknow', city: 'Lucknow', address: 'Phoenix United Mall, Gomti Nagar', state: 'Uttar Pradesh', pincode: '226010', totalSeats: 200, screens: 4, amenities: ['IMAX', 'Dolby Atmos'], isActive: true },
  { _id: 'l2', name: 'INOX Sahara', city: 'Lucknow', address: 'Sahara Mall, Faizabad Road', state: 'Uttar Pradesh', pincode: '226016', totalSeats: 160, screens: 3, amenities: ['3D', 'Recliner'], isActive: true },
  
  // Goa
  { _id: 'g1', name: 'Cinepolis Goa', city: 'Goa', address: 'Mall de Goa, Porvorim', state: 'Goa', pincode: '403501', totalSeats: 180, screens: 3, amenities: ['Dolby Atmos', 'Recliner'], isActive: true },
  { _id: 'g2', name: 'INOX Panaji', city: 'Goa', address: 'Caranzalem, Panaji', state: 'Goa', pincode: '403002', totalSeats: 120, screens: 2, amenities: ['3D'], isActive: true },
  
  // Kochi
  { _id: 'ko1', name: 'PVR Kochi', city: 'Kochi', address: 'Lulu Mall, Edappally', state: 'Kerala', pincode: '682024', totalSeats: 260, screens: 5, amenities: ['IMAX', '4DX', 'Dolby Atmos'], isActive: true },
  { _id: 'ko2', name: 'INOX Kochi', city: 'Kochi', address: 'Junction Mall, MG Road', state: 'Kerala', pincode: '682016', totalSeats: 160, screens: 3, amenities: ['3D', 'Gold Class'], isActive: true },
];

export const getTheaters = async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { isActive: true };
    if (city) filter.city = { $regex: city, $options: 'i' };

    const theaters = await Theater.find(filter).sort({ city: 1, name: 1 });
    
    if (theaters.length === 0) {
      const filtered = city ? DEMO_THEATERS.filter(t => t.city.toLowerCase().includes(city.toLowerCase())) : DEMO_THEATERS;
      return res.json({ success: true, data: filtered });
    }
    
    res.json({ success: true, data: theaters });
  } catch (error) {
    const filtered = req.query.city 
      ? DEMO_THEATERS.filter(t => t.city.toLowerCase().includes(req.query.city.toLowerCase())) 
      : DEMO_THEATERS;
    res.json({ success: true, data: filtered });
  }
};

export const getCities = async (req, res) => {
  try {
    const cities = await Theater.distinct('city', { isActive: true });
    if (cities.length === 0) {
      const uniqueCities = [...new Set(DEMO_THEATERS.map(t => t.city))].sort();
      return res.json({ success: true, data: uniqueCities });
    }
    res.json({ success: true, data: cities.sort() });
  } catch (error) {
    const uniqueCities = [...new Set(DEMO_THEATERS.map(t => t.city))].sort();
    res.json({ success: true, data: uniqueCities });
  }
};

export const getTheaterById = async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      const demo = DEMO_THEATERS.find(t => t._id === req.params.id);
      if (demo) return res.json({ success: true, data: demo });
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }
    res.json({ success: true, data: theater });
  } catch (error) {
    const demo = DEMO_THEATERS.find(t => t._id === req.params.id);
    if (demo) return res.json({ success: true, data: demo });
    res.status(404).json({ success: false, message: 'Theater not found' });
  }
};

export const createTheater = async (req, res) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json({ success: true, data: theater, message: 'Theater added' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTheater = async (req, res) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theater) return res.status(404).json({ success: false, message: 'Theater not found' });
    res.json({ success: true, data: theater });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTheater = async (req, res) => {
  try {
    await Theater.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Theater removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
