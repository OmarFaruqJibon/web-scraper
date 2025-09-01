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
    <div className="min-h-screen bg-gray-50 text-gray-800 flex gap-y-4">
      <div className="form-container w-1/3">
        <FormData onSuccess={fetchData} />
      </div>

      <div className="w-2/3 mx-auto mt-10">
        <h2 className="font-bold text-2xl mb-6 text-center text-gray-800">
          Scraped Data
        </h2>

        {data.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6 bg-white rounded-lg shadow border">
            No data found
          </p>
        ) : (
          <div className="space-y-8">
            {/* {data.map((item, index) => ( */}
            <div className="space-y-8">
              {data.slice(-1).map((info) =>
                info.information.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow border border-gray-300 mb-10"
                  >
                    {/* URL + Title */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <strong className="text-gray-800">🔗 URL :</strong>{" "}
                        <span className="break-all">
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-900"
                            href={info.url}
                          >
                            {info.url}
                          </a>
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong className="text-gray-800">Title :</strong>{" "}
                        {info.title || "Title not found!"}
                      </p>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                      <div className="min-h-[200px] max-h-[500px] overflow-y-auto w-full border border-gray-300 rounded-lg">
                        <table className="min-w-[1000px] text-sm">
                          <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 text-left border border-gray-300 w-1/5">
                                Names
                              </th>
                              <th className="px-4 py-3 text-left border border-gray-300 w-1/5">
                                Emails
                              </th>
                              <th className="px-4 py-3 text-left border border-gray-300 w-1/5">
                                Phones
                              </th>
                              <th className="px-4 py-3 text-left border border-gray-300 w-1/5">
                                Images
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {/* Names */}
                              <td className="px-4 py-3 border border-gray-300 align-top">
                                {item.name
                                  ? item.name
                                  : "No names found in this page!"}
                              </td>

                              {/* Emails */}
                              <td className="px-4 py-3 border border-gray-300 align-top">
                                {item.email ? (
                                  <a
                                    href={`mailto:${item.email}`}
                                    className="text-gray-900"
                                  >
                                    {item.email}
                                  </a>
                                ) : (
                                  "No email found in this page!"
                                )}
                              </td>

                              {/* Phones */}
                              <td className="px-4 py-3 border border-gray-300 align-top">
                                {item.phone ? (
                                  <a
                                    href={`tel:${item.phone}`}
                                    className="text-green-900"
                                  >
                                    {item.phone}
                                  </a>
                                ) : (
                                  "No phone number found in this page!"
                                )}
                              </td>

                              {/* Images */}
                              <td className="px-4 py-3 border border-gray-300 align-top">
                                {info.images?.length > 0 ? (
                                  <ul className="space-y-1">
                                    {info.images.map((img, i) => (
                                      <li key={i}>
                                        <a
                                          href={img}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-purple-900 break-all"
                                        >
                                          {img}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  "No image found in this page!"
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
