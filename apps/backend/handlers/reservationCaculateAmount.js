module.exports = async (req, res, manifest) => {
  const trip = await manifest
    .from("trips")
    .with(["seats"])
    .findOneById(req.body["tripId"]);
  const seats = trip.seats.filter((seat) =>
    req.body["seatIds"].includes(seat.id)
  );

  req.body["totalAmount"] = trip.price * seats.length;
};
