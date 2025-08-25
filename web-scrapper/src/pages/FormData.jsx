import { useState } from "react";
import api from "../callApi";

const FormData = ({ onSuccess }) => {
  const [url, setUrl] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // start loading

    const formData = {
      url,
      selectedOptions: Array.isArray(selectedOptions)
        ? selectedOptions
        : [selectedOptions],
      description,
    };

    try {
      await api.post("/data", formData);
      console.log("Form submitted:", formData);

      setUrl("");
      setSelectedOptions([]);
      setDescription("");

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding data", error.response?.data || error.message);
    } finally {
      setIsLoading(false); // stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-20 text-center">
          Web Scraper Input
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Target URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Selection Options */}
          {/* <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Data Type to Scrape
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["Numbers", "Images", "Links", "Persons"].map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={() => handleOptionChange(option)}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="text-gray-700 text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div> */}

          {/* Description */}
          {/* <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your scraping needs..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading} // disable while scraping
            className={`w-full font-medium py-3 rounded-xl shadow-md transition-all duration-300 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isLoading ? "Scraping..." : "Start Scraping"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormData;
