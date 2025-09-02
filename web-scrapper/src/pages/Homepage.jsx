import { useState, useEffect } from "react";
import api from "../callApi";
import FormData from "./FormData";

const Homepage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await api.get("/data");
      setData(response?.data?.dataCollections);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(data);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex gap-6">
      {/* Left: Form */}
      <div className="form-container w-1/3">
        <FormData onSuccess={fetchData} />
      </div>

      {/* Right: Scraped Data */}
      <div className="w-2/3 mx-auto mt-10">
        <h2 className="font-bold text-2xl mb-6 text-center text-gray-800">
          Scraped Data
        </h2>

        {data.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6 bg-white rounded-lg shadow border">
            No data found
          </p>
        ) : (
          <div className="space-y-10">
            {data
              .filter((info) => info?.information?.length > 0)
              .map((info, infoIndex) => (
                <div
                  key={infoIndex}
                  className="bg-white p-6 rounded-xl shadow border border-gray-300"
                >
                  {/* URL + Title */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600">
                      <strong className="text-gray-800">🔗 URL :</strong>{" "}
                      <span className="break-all">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-900 hover:underline"
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
                    <div className="max-h-[500px] overflow-y-auto w-full border border-gray-300 rounded-lg">
                      <table className="min-w-[800px] text-sm border-collapse">
                        <thead className="bg-gray-100 text-gray-800 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left border border-gray-300">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left border border-gray-300">
                              Email
                            </th>
                            <th className="px-4 py-3 text-left border border-gray-300">
                              Phone
                            </th>
                            <th className="px-4 py-3 text-left border border-gray-300">
                              Location
                            </th>
                            <th className="px-4 py-3 text-left border border-gray-300">
                              Image
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {info.information.map((item, i) => (
                            <tr
                              key={i}
                              className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition"
                            >
                              {/* Name */}
                              <td className="px-4 py-3 border border-gray-300">
                                {item.name || "N/A"}
                              </td>

                              {/* Email */}
                              <td className="px-4 py-3 border border-gray-300">
                                {item.email ? (
                                  <a
                                    href={`mailto:${item.email}`}
                                    className="text-blue-700 hover:underline"
                                  >
                                    {item.email}
                                  </a>
                                ) : (
                                  "N/A"
                                )}
                              </td>

                              {/* Phone */}
                              <td className="px-4 py-3 border border-gray-300">
                                {item.phone ? (
                                  <a
                                    href={`tel:${item.phone}`}
                                    className="text-green-700 hover:underline"
                                  >
                                    {item.phone}
                                  </a>
                                ) : (
                                  "N/A"
                                )}
                              </td>

                              {/* Location */}
                              <td className="px-4 py-3 border border-gray-300">
                                {item.location || "N/A"}
                              </td>

                              {/* Image */}
                              <td className="px-4 py-3 border border-gray-300">
                                {item.image ? (
                                  <a
                                    href={item.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={item.image}
                                      alt={item.image}
                                      className="w-12 h-12 rounded-full object-cover border"
                                    />
                                  </a>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
