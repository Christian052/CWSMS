import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar"; // Assuming Sidebar handles its own responsiveness

// Import Font Awesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faTimes,
  faSpinner,
  faBoxOpen, // Example icon for package management
} from "@fortawesome/free-solid-svg-icons";

const Managerpackage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [packageData, setPackageData] = useState({
    PackageName: "",
    PackageDescription: "",
    PackagePrice: "",
  });

  const [editFormData, setEditFormData] = useState({
    PackageName: "",
    PackageDescription: "",
    PackagePrice: "",
  });

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/packages");
      setPackages(res.data);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      alert("Error fetching packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleChange = (e) => {
    setPackageData({ ...packageData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/packages", packageData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Package added successfully!");
      setShowUploadForm(false);
      setPackageData({
        PackageName: "",
        PackageDescription: "",
        PackagePrice: "",
      });
      fetchPackages();
    } catch (error) {
      console.error("Add failed:", error.response?.data || error.message);
      alert("Failed to add package");
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setEditFormData({ ...pkg });
  };

  // const handleEditSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     await axios.put(
  //       `http://localhost:5000/api/packages/${editingPackage.PackageNumber}`,
  //       editFormData,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );

  //     alert("Package updated successfully!");
  //     setEditingPackage(null);
  //     fetchPackages();
  //   } catch (error) {
  //     console.error("Update failed:", error);
  //     alert("Failed to update package");
  //   }
  // };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/packages/${editingPackage.PackageNumber}`,
        editFormData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      alert("Package updated successfully!");
      setEditingPackage(null);
      fetchPackages();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update Packager");
    }
  };



  // const handleDelete = async (PackageNumber) => {
  //   if (!window.confirm("Are you sure you want to delete this package?")) return;

  //   try {
  //     await axios.delete(`http://localhost:5000/api/packages/${PackageNumber}`);
  //     alert("Package deleted!");
  //     fetchPackages();
  //   } catch (error) {
  //     console.error("Delete failed:", error);
  //     alert("Failed to delete package");
  //   }
  // };


const handleDelete = async (PackageNumber) => {
    if (!window.confirm("Are you sure you want to delete this Package?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/packages/${PackageNumber}`);
      alert("Package deleted!");
      fetchPackages();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete Package");
    }
  };




  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold  flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxOpen} className="text-blue-600" />
            Package Management
          </h1>
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New Package
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-600 flex items-center justify-center gap-2 py-8">
            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />
            Loading packages...
          </p>
        ) : (
          /* Packages Table */
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm text-left text-gray-700 bg-white">
              <thead className="text-xs text-white uppercase bg-blue-600 ">
                <tr>
                  <th scope="col" className="px-3 py-3 sm:px-6 sm:py-4">No</th>
                  <th scope="col" className="px-3 py-3 sm:px-6 sm:py-4">Package Name</th>
                  <th scope="col" className="px-3 py-3 sm:px-6 sm:py-4 hidden md:table-cell">Description</th> {/* Hide on small screens */}
                  <th scope="col" className="px-3 py-3 sm:px-6 sm:py-4 text-center">Price</th>
                  <th scope="col" className="px-3 py-3 sm:px-6 sm:py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody >
                {packages.length > 0 ? (
                  packages.map((pkg, index) => (
                    <tr
                      key={pkg.PackageNumber}
                      className="border-b hover:bg-gray-100 transition duration-150 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    >
                      <td className="px-3 py-3 sm:px-6 sm:py-4 font-medium">{index + 1}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 font-semibold">{pkg.PackageName}</td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 hidden md:table-cell ">
                        {pkg.PackageDescription}
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-center whitespace-nowrap">
                        ${pkg.PackagePrice}
                      </td>
                      <td className="px-3 py-3 sm:px-6 sm:py-4 text-center space-x-1 sm:space-x-2 flex flex-col sm:flex-row items-center justify-center">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-150 flex items-center gap-1 mb-1 sm:mb-0"
                          title="Edit Package"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(pkg.PackageNumber)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-150 flex items-center gap-1"
                          title="Delete Package"
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
                      colSpan="5" // Adjusted colspan due to hidden column
                      className="px-6 py-8 text-center text-gray-500 italic"
                    >
                      No packages found.
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative dark:bg-gray-800 dark:text-white "
          >
            <h2 className="text-xl font-semibold mb-6 ">Add New Package</h2>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="absolute top-4 right-4  hover:text-gray-700 text-lg"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {["PackageName", "PackageDescription", "PackagePrice"].map((field) => (
              <div key={field} className="mb-4">
                <label className="block mb-1 font-medium ">
                  {field.replace(/([A-Z])/g, " $1").trim()} {/* Makes "PackageName" into "Package Name" */}
                </label>
                <input
                  type={field === "PackagePrice" ? "number" : "text"}
                  name={field}
                  value={packageData[field]}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:text-black"
                  placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
                  required
                />
              </div>
            ))}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md  hover:bg-gray-100 transition duration-150"
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
      {editingPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative dark:bg-gray-800 dark:text-white "
          >
            <h2 className="text-xl font-semibold mb-6 ">Edit Package</h2>
            <button
              type="button"
              onClick={() => setEditingPackage(null)}
              className="absolute top-4 right-4  hover:text-gray-700 text-lg"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {["PackageName", "PackageDescription", "PackagePrice"].map((field) => (
              <div key={field} className="mb-4">
                <label className="block mb-1 font-medium ">
                  {field.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <input
                  type={field === "PackagePrice" ? "number" : "text"}
                  name={field}
                  value={editFormData[field]}
                  onChange={handleEditChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:text-black"
                  placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").trim()}`}
                  required
                />
              </div>
            ))}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="px-4 py-2 border border-gray-300 rounded-md  hover:bg-gray-100 transition duration-150"
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

export default Managerpackage;