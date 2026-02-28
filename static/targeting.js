function closeRecticleRange (range_data) {
  const nearest_range_bar = document.getElementById("range-bar");

  nearest_range_bar.style.mask = "conic-gradient(#000 0% " + String(range_data) + "%, transparent " + String(range_data) + "% 100%)";
}