module.exports = async (req, res, manifest) => {
  function generatePNR() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const length = 6;

    const randomChar = () =>
      alphabet[Math.floor(Math.random() * alphabet.length)];
    const code = Array.from({ length }, randomChar).join("");

    return `PNR_${code}`;
  }

  const reservation = await manifest
    .from("reservations")
    .findOneById(req.body["reservationId"]);

  await manifest.from("reservations").patch(req.body["reservationId"], {
    status: "confirmed",
    pnr: generatePNR(),
  });

  req.body["amount"] = reservation.totalAmount;
};
