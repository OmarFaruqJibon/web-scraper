import { useState, useEffect } from "react";
import api from "../callApi";
import FormData from "./FormData";

const Homepage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await api.get("/data");
      setData(response.data.dataCollections);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(data);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      {/* Form */}
      <FormData onSuccess={fetchData} />

      <div className="max-w-6xl mx-auto mt-10">
        <h2 className="font-bold text-3xl mb-6 text-center text-gray-800">
          Scraped Data
        </h2>

        {data.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6 bg-white rounded-lg shadow border">
            No data found
          </p>
        ) : (
          <div className="space-y-8">
            {data.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow border border-gray-300"
              >
                {/* URL + Title */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-800">🔗 URL:</strong>{" "}
                    <span className="break-all">{item.url || "N/A"}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong className="text-gray-800">📌 Title:</strong>{" "}
                    {item.scrapedData?.title || "N/A"}
                  </p>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-gray-300 rounded-lg">
                    <thead className="bg-gray-100 text-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left border border-gray-300 w-1/4">
                          Emails
                        </th>
                        <th className="px-4 py-3 text-left border border-gray-300 w-1/4">
                          Phones
                        </th>
                        <th className="px-4 py-3 text-left border border-gray-300 w-1/4">
                          Links
                        </th>
                        <th className="px-4 py-3 text-left border border-gray-300 w-1/4">
                          Images
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {/* Emails */}
                        <td className="px-4 py-3 border border-gray-300 align-top">
                          {item.scrapedData?.emails?.length > 0 ? (
                            <ul className="space-y-1">
                              {item.scrapedData.emails.map((email, i) => (
                                <li key={i}>
                                  <a
                                    href={`mailto:${email}`}
                                    className="text-blue-600 underline"
                                  >
                                    {email}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </td>

                        {/* Phones */}
                        <td className="px-4 py-3 border border-gray-300 align-top">
                          {item.scrapedData?.phones?.length > 0 ? (
                            <ul className="space-y-1">
                              {item.scrapedData.phones.map((phone, i) => (
                                <li key={i}>
                                  <a
                                    href={`tel:${phone}`}
                                    className="text-green-600 underline"
                                  >
                                    {phone}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </td>

                        {/* Links */}
                        <td className="px-4 py-3 border border-gray-300 align-top">
                          {item.scrapedData?.links?.length > 0 ? (
                            <ul className="space-y-1">
                              {item.scrapedData.links.map((link, i) => (
                                <li key={i}>
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 underline break-all"
                                  >
                                    {link}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </td>

                        {/* Images (as links) */}
                        <td className="px-4 py-3 border border-gray-300 align-top">
                          {item.scrapedData?.images?.length > 0 ? (
                            <ul className="space-y-1">
                              {item.scrapedData.images.map((img, i) => (
                                <li key={i}>
                                  <a
                                    href={img}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-600 underline break-all"
                                  >
                                    {img}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
