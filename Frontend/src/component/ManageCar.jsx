import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar"; // Assuming Sidebar handles its own responsiveness

// Import Font Awesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faSpinner,
  faCar, 
  faRoad, 
  faTag, 
  faRulerCombined, 
  faUserTie, 
  faPhone, 
} from "@fortawesome/free-solid-svg-icons";

const ManagerCar = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [carData, setCarData] = useState({
    PlateNumber: "",
    CarType: "",
    CarSize: "",
    DriverName: "",
    PhoneNumber: "",
  });

  const [editingCar, setEditingCar] = useState(null);
  const [editFormData, setEditFormData] = useState({ ...carData });

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/Car");
      setCars(res.data);
    } catch (error) {
      console.error("Failed to fetch cars:", error);
      alert("Error fetching cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleChange = (e) => {
    setCarData({ ...carData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/car", carData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Car uploaded successfully!");
      setShowUploadForm(false);
      setCarData({
        PlateNumber: "",
        CarType: "",
        CarSize: "",
        DriverName: "",
        PhoneNumber: "",
      });
      fetchCars();
    } catch (error) {
      console.error("Add failed:", error.response?.data || error.message);
      alert("Failed to add car");
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setEditFormData({ ...car });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/car/${editingCar.PlateNumber}`,
        editFormData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      alert("Car updated successfully!");
      setEditingCar(null);
      fetchCars();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update car");
    }
  };

  const handleDelete = async (PlateNumber) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/car/${PlateNumber}`);
      alert("Car deleted!");
      fetchCars();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete car");
    }
  };

  // Helper function to format field names for display
  const formatFieldName = (fieldName) => {
    return fieldName.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="flex min-h-screen  bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold  flex items-center gap-2">
            <FontAwesomeIcon icon={faCar} className="text-blue-600" />
            Car Management
          </h1>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Car
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-600 flex items-center justify-center gap-2 py-8">
            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />
            Loading cars...
          </p>
        ) : (
          /* Cars Table */
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm text-left   bg-gray-50 dark:bg-gray-800 text-black dark:text-white">
              <thead className="text-xs  uppercase bg-blue-600 text-white">
                <tr>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3">No</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3">Plate Number</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 hidden md:table-cell">Car Type</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 hidden lg:table-cell">Car Size</th> {/* Hide on medium screens */}
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 text-center">Driver Name</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 text-center hidden sm:table-cell">Phone Number</th> {/* Hide on very small screens */}
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {cars.length > 0 ? (
                  cars.map((car, index) => (
                    <tr
                      key={car.PlateNumber}
                      className="border-b hover:bg-gray-100 transition duration-150 dark:hover:bg-gray-700"
                    >
                      <td className="px-3 py-3 sm:px-4 sm:py-3 font-medium">{index + 1}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 font-semibold">{car.PlateNumber}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 hidden md:table-cell ">{car.CarType}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 hidden lg:table-cell ">{car.CarSize}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 text-center whitespace-nowrap">{car.DriverName}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 text-center whitespace-nowrap hidden sm:table-cell">{car.PhoneNumber}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 text-center space-x-1 sm:space-x-2 flex flex-col sm:flex-row items-center justify-center">
                        <button
                          onClick={() => handleEdit(car)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-150 flex items-center gap-1 mb-1 sm:mb-0"
                          title="Edit Car"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(car.PlateNumber)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-150 flex items-center gap-1"
                          title="Delete Car"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500 italic"
                    >
                      No cars found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Add New Car</h2>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {Object.keys(carData).map((field) => (
              <div key={field} className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  {formatFieldName(field)}
                </label>
                <input
                  type={field === "PhoneNumber" ? "tel" : "text"} 
                  name={field}
                  value={carData[field]}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Enter ${formatFieldName(field)}`}
                  required
                />
              </div>
            ))}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                Upload
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Edit Car</h2>
            <button
              type="button"
              onClick={() => setEditingCar(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {Object.keys(editFormData).map((field) => (
              <div key={field} className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  {formatFieldName(field)}
                </label>
                <input
                  type={field === "PhoneNumber" ? "tel" : "text"}
                  name={field}
                  value={editFormData[field]}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Enter ${formatFieldName(field)}`}
                  required
                  disabled={field === "PlateNumber"} // PlateNumber should typically not be editable
                />
              </div>
            ))}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingCar(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faEdit} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManagerCar;