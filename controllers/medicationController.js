const Medication = require('../models/Medication');

// ➤ Create Medication
exports.addMedication = async (req, res) => {
    try {
        const newMedication = new Medication(req.body);
        await newMedication.save();
        res.json({ message: 'Medication saved successfully ✅' });
    } catch (err) {
        console.error('Error saving medication:', err);
        res.status(500).json({ error: 'Failed to save medication ❌' });
    }
};

// ➤ Get Medications
exports.getMedications = async (req, res) => {
    try {
        const { userId } = req.params;
        const medications = await Medication.find({ userId }).sort({ createdAt: -1 });
        res.json({ medications });
    } catch (err) {
        console.error('Error fetching medications:', err);
        res.status(500).json({ error: 'Failed to fetch medications' });
    }
};

// ➤ Update Medication
exports.updateMedication = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedMed = await Medication.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedMed) return res.status(404).json({ error: "Medication not found ❌" });

        res.json({ message: "Medication updated successfully ✅", medication: updatedMed });
    } catch (err) {
        console.error('Error updating medication:', err);
        res.status(500).json({ error: "Failed to update medication ❌" });
    }
};

// ➤ Delete Medication
exports.deleteMedication = async (req, res) => {
    try {
        await Medication.findByIdAndDelete(req.params.id);
        res.json({ message: "Medication deleted ✅" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete medication ❌" });
    }
};

