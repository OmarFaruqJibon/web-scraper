import { useState, useEffect } from "react";
import api from "../callApi";
import FormData from "./FormData";

const Homepage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await api.get("/data");
      console.log("Fetched:", response.data);

      // Access the array correctly
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
    <div>
      {/* Pass fetchData to refresh list after form submit */}
      <FormData onSuccess={fetchData} />

      <div className="show-data max-w-4xl mx-auto mt-8">
        <h2 className="font-bold text-2xl text-gray-800 mb-4">📦 Scraped Data</h2>
        {data.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6 bg-gray-50 rounded-lg shadow">
            No data found
          </p>
        ) : (
          <div className="space-y-6">
            {data.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 shadow-md p-5 rounded-xl bg-white hover:shadow-lg transition-all duration-200"
              >
                {/* URL */}
                <p className="text-sm text-gray-600 mb-2">
                  <strong className="text-gray-800">🔗 URL:</strong> {item.url}
                </p>

                {/* Options */}
                {/* <p className="text-sm text-gray-600 mb-2">
                  <strong className="text-gray-800">⚙️ Options:</strong>{" "}
                  {Array.isArray(item.selectedOptions)
                    ? item.selectedOptions.join(", ")
                    : item.selectedOptions}
                </p> */}

                {/* Description */}
                {/* <p className="text-sm text-gray-600 mb-4">
                  <strong className="text-gray-800">📝 Description:</strong>{" "}
                  {item.description}
                </p> */}

                {/* Products Table */}
                {Array.isArray(item.scrapedData) && item.scrapedData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left border">#</th>
                          <th className="px-4 py-2 text-left border">Product Title</th>
                          <th className="px-4 py-2 text-left border">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.scrapedData.map((product, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 transition duration-150"
                          >
                            <td className="px-4 py-2 border">{idx + 1}</td>
                            <td className="px-4 py-2 border">{product.title}</td>
                            <td className="px-4 py-2 border">{product.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No products scraped</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
