export default async function handler(req, res) {
  if (req.method === "POST") {
    const { hit, config, compared_to, query, position } = req.body;

    const data = {
      api_key: process.env.AMPLITUDE_API_KEY,
      events: [
        {
          device_id: "<INSERT DEVICE ID>",
          event_type: "Star Clicked",
          event_properties: { hit, config, compared_to, query, position },
        },
      ],
    };

    try {
      const response = await fetch("https://api2.amplitude.com/2/httpapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Error sending data to Amplitude" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
