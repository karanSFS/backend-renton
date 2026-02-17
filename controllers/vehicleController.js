const Vehicle = require('../models/Vehicle');

// @desc    Fetch all vehicles
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res) => {
    try {
        const { type, minPrice, maxPrice, isAvailable } = req.query;
        
        let query = { isActive: true }; // Only fetch active vehicles

        if (type) query.type = type;
        if (isAvailable) query.isAvailable = isAvailable === 'true';
        
        if (minPrice || maxPrice) {
            query.pricePerDay = {};
            if (minPrice) query.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
        }

        const vehicles = await Vehicle.find(query);
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (vehicle) {
            res.json(vehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Vehicle not found' });
    }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
const createVehicle = async (req, res) => {
    console.log('Create Vehicle Request Body:', req.body);
    console.log('Create Vehicle Request Files:', req.files);

    try {
        const { 
            name, type, pricePerDay, extraChargePerHour, description, 
            transmission, fuelType, capacity, address, pickupLocation, contactPhone
        } = req.body;

        // Handle Images
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path);
        } else if (req.body.images) {
            // Handle if images sent as URLs in body (e.g. testing or existing images)
            const bodyImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
            // Filter out any non-string values (like the object metadata causing the crash)
            images = bodyImages.filter(img => typeof img === 'string' && img.startsWith('http'));
        }

        if (images.length === 0) {
            return res.status(400).json({ message: 'At least one image is required' });
        }

        // Parse pickupLocation if stringified (FormData)
        let parsedLocation;
        try {
            if (!pickupLocation) {
                 return res.status(400).json({ message: 'Pickup location is required' });
            }
            parsedLocation = typeof pickupLocation === 'string' ? JSON.parse(pickupLocation) : pickupLocation;
            
            // Validate parsed location structure
            if (!parsedLocation.lat || !parsedLocation.lng) {
                return res.status(400).json({ message: 'Pickup location must have lat and lng' });
            }
        } catch (e) {
            return res.status(400).json({ message: 'Invalid pickupLocation format' });
        }

        const vehicle = new Vehicle({
            name,
            type,
            pricePerDay,
            extraChargePerHour: extraChargePerHour || 0,
            description,
            transmission,
            fuelType,
            capacity,
            address,
            pickupLocation: parsedLocation,
            images,
            isAvailable: true,
            isAvailable: true,
            isActive: true,
            contactPhone
        });

        const createdVehicle = await vehicle.save();
        res.status(201).json(createdVehicle);
    } catch (error) {
        console.error("Create Vehicle Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (vehicle) {
            const { 
                name, type, pricePerDay, extraChargePerHour, description, 
                transmission, fuelType, capacity, address, pickupLocation, 
                isAvailable, isActive, contactPhone
            } = req.body;

            vehicle.name = name || vehicle.name;
            vehicle.type = type || vehicle.type;
            vehicle.pricePerDay = pricePerDay || vehicle.pricePerDay;
            vehicle.extraChargePerHour = extraChargePerHour !== undefined ? extraChargePerHour : vehicle.extraChargePerHour;
            vehicle.description = description || vehicle.description;
            vehicle.transmission = transmission || vehicle.transmission;
            vehicle.fuelType = fuelType || vehicle.fuelType;
            vehicle.capacity = capacity || vehicle.capacity;
            vehicle.address = address || vehicle.address;

            if (pickupLocation) {
                 try {
                    vehicle.pickupLocation = typeof pickupLocation === 'string' ? JSON.parse(pickupLocation) : pickupLocation;
                } catch (e) {
                    // keep old if parse fails? or throw? mostly safe to ignore or keep old
                }
            }
            
            vehicle.contactPhone = contactPhone || vehicle.contactPhone;
            
            if (isAvailable !== undefined) vehicle.isAvailable = isAvailable;
            if (isActive !== undefined) vehicle.isActive = isActive;

            // Handle Images (Append or Replace? usually Replace for simplified update)
            if (req.files && req.files.length > 0) {
                 vehicle.images = req.files.map(file => file.path);
            }

            const updatedVehicle = await vehicle.save();
            res.json(updatedVehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a vehicle (Soft delete)
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (vehicle) {
            vehicle.isActive = false; // Soft delete
            await vehicle.save();
            res.json({ message: 'Vehicle deactivated' });
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};
