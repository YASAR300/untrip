const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const db = mongoose.connection;

// Get a specific flight by ID
router.get("/api/flight/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Requested ObjectId:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid ObjectId format" });
    }

    const flight = await db.collection("Flights").findOne({ _id: new mongoose.Types.ObjectId(id) });

    console.log("Query Result:", flight);

    if (!flight) {
      return res.status(404).json({ status: false, message: "Flight not found" });
    }

    return res.json({ status: true, message: "Success", data: flight });
  } catch (error) {
    console.error("Error fetching flight:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

// Get all flights
router.get("/api/flights", async (req, res) => {
  try {
    console.log("Fetching all flights...");

    const flights = await db.collection("Flights").find({}).toArray();

    console.log("Total Flights Found:", flights.length);

    if (flights.length === 0) {
      return res.status(404).json({ status: false, message: "No flights found" });
    }

    return res.json({ status: true, message: "Success", data: flights });
  } catch (error) {
    console.error("Error fetching all flights:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

// Search flights based on query parameters
router.get("/api/search-flight", async (req, res) => {
  try {
    const { departure, arrival, airline, min_price, max_price, departureDate } = req.query;
    let query = {};

    // Filter by departure city
    if (departure) {
      query["from.city"] = { $regex: new RegExp(departure, "i") };
    }

    // Filter by arrival city
    if (arrival) {
      query["to.city"] = { $regex: new RegExp(arrival, "i") };
    }

    // Filter by airline name
    if (airline) {
      query["airline.name"] = { $regex: new RegExp(airline, "i") };
    }

    // Filter by price range
    if (min_price || max_price) {
      query["price.units"] = {};
      if (min_price) query["price.units"].$gte = parseFloat(min_price);
      if (max_price) query["price.units"].$lte = parseFloat(max_price);
    }

    // Filter by departure date (optional, based on your SearchBox usage)
    if (departureDate) {
      query["departureDate"] = departureDate; 
    }

    console.log("Search Query:", query);

    const flights = await db.collection("Flights").find(query).toArray();

    console.log("Flights Found:", flights.length);

    if (flights.length === 0) {
      return res.status(404).json({ status: false, message: "No flights found matching criteria" });
    }

    return res.json({ status: true, message: "Success", data: flights });
  } catch (error) {
    console.error("Error searching flights:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

module.exports = router;