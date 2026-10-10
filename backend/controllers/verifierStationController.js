import VerifierStation from '../models/VerifierStation.js';

// @desc    Get all Verifier Stations & Gate Locations (ER Diagram Verifier entity)
// @route   GET /api/stations
// @access  Public
export const getStations = async (req, res) => {
  try {
    let stations = await VerifierStation.find().sort({ stationName: 1 });

    // Seed default campus stations if empty
    if (stations.length === 0) {
      const defaultStations = [
        { stationId: 'STN-GATE-01', stationName: 'Main Entrance Gate #1', location: 'Campus Main Gate', verifierName: 'Security Officer Murugan', status: 'ONLINE', totalScansToday: 48 },
        { stationId: 'STN-EXAM-02', stationName: 'Examination Hall B', location: 'Academic Block 2', verifierName: 'Faculty Invigilator Priya', status: 'ONLINE', totalScansToday: 112 },
        { stationId: 'STN-LIB-03', stationName: 'Central Library Turnstile', location: 'Knowledge Center', verifierName: 'Library Staff Rajesh', status: 'ONLINE', totalScansToday: 73 },
        { stationId: 'STN-LAB-04', stationName: 'AI & Research Lab Terminal', location: 'CS Lab 3rd Floor', verifierName: 'Lab Administrator', status: 'ONLINE', totalScansToday: 29 }
      ];
      stations = await VerifierStation.insertMany(defaultStations);
    }

    res.json({ success: true, count: stations.length, stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update a verifier station
// @route   POST /api/stations
// @access  Private (Admin)
export const createStation = async (req, res) => {
  try {
    const { stationId, stationName, location, verifierName, deviceType } = req.body;
    const station = await VerifierStation.create({
      stationId: stationId || `STN-${Date.now().toString(36).toUpperCase()}`,
      stationName,
      location,
      verifierName: verifierName || 'Authorized Verifier',
      deviceType: deviceType || 'Optical Scanner'
    });
    res.status(201).json({ success: true, station });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record scan activity at a station
// @route   POST /api/stations/:id/scan
// @access  Public
export const recordStationScan = async (req, res) => {
  try {
    const station = await VerifierStation.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { stationId: req.params.id }] },
      { $inc: { totalScansToday: 1 }, lastScanAt: new Date() },
      { new: true }
    );
    res.json({ success: true, station });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
