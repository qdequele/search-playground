import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { feedback, rating } = req.body;

    try {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Feedback: {
            title: [
              {
                text: {
                  content: feedback,
                },
              },
            ],
          },
          Rating: {
            select: {
              name: rating,
            },
          },
        },
      });

      res.status(200).json({ message: "Feedback sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send feedback" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
