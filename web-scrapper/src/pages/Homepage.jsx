import { useState, useEffect } from "react";
import api from "../callApi";
import FormData from "./FormData";

const Homepage = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await api.get("/data");
      console.log("Fetched:", response.data);

      //  Access the array correctly
      setData(response.data.dataCollections);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* Pass fetchData to refresh list after form submit */}
      <FormData onSuccess={fetchData} />

      <div className="show-data max-w-3xl mx-auto mt-8">
  <h2 className="font-bold text-2xl text-gray-800 mb-4">📦 Stored Data</h2>
  {data.length === 0 ? (
    <p className="text-gray-500 italic text-center py-6 bg-gray-50 rounded-lg shadow">
      No data found
    </p>
  ) : (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 shadow-sm p-5 rounded-xl bg-white hover:shadow-md transition-all duration-200"
        >
          <p className="text-sm text-gray-600">
            <strong className="text-gray-800">🔗 URL:</strong> {item.url}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong className="text-gray-800">⚙️ Options:</strong>{" "}
            {Array.isArray(item.selectedOptions)
              ? item.selectedOptions.join(", ")
              : item.selectedOptions}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong className="text-gray-800">📝 Description:</strong>{" "}
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

    </div>
  );
};

export default Homepage;
