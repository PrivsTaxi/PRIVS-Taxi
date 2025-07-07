const map = L.map("map").setView([49.6116, 6.1319], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let startMarker, endMarker, routeLine;

async function geocode(q) {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
    if (!resp.ok) throw new Error("Erreur de géocodage");
    const data = await resp.json();
    if (!data[0]) throw new Error("Adresse introuvable");
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

async function calculateRoute(start, dest) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${dest.lon},${dest.lat}?overview=full&geometries=geojson`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Erreur de calcul d'itinéraire");
    const json = await resp.json();
    return json.routes[0];
}

function displayRoute(route, start, dest) {
    if (routeLine) map.removeLayer(routeLine);
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    routeLine = L.geoJSON(route.geometry).addTo(map);
    startMarker = L.marker([start.lat, start.lon]).addTo(map);
    endMarker = L.marker([dest.lat, dest.lon]).addTo(map);
    map.fitBounds(routeLine.getBounds());
    const distanceKm = route.distance / 1000;
    document.getElementById("distance").textContent = distanceKm.toFixed(2) + " km";
    document.getElementById("price").textContent = (distanceKm * 2).toFixed(2) + " €";
}

document.getElementById("route-form").addEventListener("submit", async e => {
    e.preventDefault();
    const startText = document.getElementById("pickup").value;
    const endText = document.getElementById("destination").value;
    try {
        const [start, dest] = await Promise.all([geocode(startText), geocode(endText)]);
        const route = await calculateRoute(start, dest);
        displayRoute(route, start, dest);
    } catch (err) {
        alert(err.message);
    }
});

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 13);
    }, () => {
        console.warn("Impossible de récupérer la position de l'utilisateur");
    });
} else {
    console.warn("La géolocalisation n'est pas supportée");
}
