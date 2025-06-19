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
  faDollarSign, // Icon for Amount Paid
  faCalendarAlt, // Icon for Payment Date
  faFileInvoice, // Icon for Record Number
  faMoneyBillWave, // Main icon for Payment Management
} from "@fortawesome/free-solid-svg-icons";

const ManageUser = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [formData, setFormData] = useState({
    AmountPaid: "",
    PaymentDate: "",
    RecordNumber: "",
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      alert("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/payments", formData, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Payment added!");
      setFormData({ AmountPaid: "", PaymentDate: "", RecordNumber: "" });
      setShowForm(false);
      fetchPayments();
    } catch (err) {
      console.error("Error adding payment:", err);
      alert("Failed to add payment");
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      AmountPaid: payment.AmountPaid,
      PaymentDate: payment.PaymentDate.slice(0, 16), // format to "YYYY-MM-DDTHH:mm"
      RecordNumber: payment.RecordNumber,
    });
    setShowForm(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/api/payments/${editingPayment.PaymentNumber}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Payment updated!");
      setShowForm(false);
      setEditingPayment(null);
      fetchPayments();
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment");
    }
  };

  const handleDelete = async (PaymentNumber) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/payments/${PaymentNumber}`);
      alert("Payment deleted!");
      fetchPayments();
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert("Failed to delete payment");
    }
  };

  // Helper function to format field names for display
  const formatFieldName = (fieldName) => {
    return fieldName.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faMoneyBillWave} className="text-blue-600" />
            User Management
          </h1>
          <button
            onClick={() => {
              setEditingPayment(null);
              setFormData({ AmountPaid: "", PaymentDate: "", RecordNumber: "" });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New User
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-600 flex items-center justify-center gap-2 py-8">
            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500" />
            Loading payments...
          </p>
        ) : (
          /* Payments Table */
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full text-sm text-left text-gray-700 bg-white">
              <thead className="text-xs text-white uppercase bg-blue-600">
                <tr>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3">No</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3">Amount Paid</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3">Payment Date</th>
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 hidden md:table-cell">Record Number</th> {/* Hidden on small screens */}
                  <th scope="col" className="px-3 py-3 sm:px-4 sm:py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment, index) => (
                    <tr
                      key={payment.PaymentNumber}
                      className="border-b hover:bg-gray-100 transition duration-150"
                    >
                      <td className="px-3 py-3 sm:px-4 sm:py-3 font-medium">{index + 1}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 font-semibold">${payment.AmountPaid}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 whitespace-nowrap">
                        {new Date(payment.PaymentDate).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 hidden md:table-cell text-gray-600">{payment.RecordNumber}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-3 text-center space-x-1 sm:space-x-2 flex flex-col sm:flex-row items-center justify-center">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-150 flex items-center gap-1 mb-1 sm:mb-0"
                          title="Edit Payment"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(payment.PaymentNumber)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-150 flex items-center gap-1"
                          title="Delete Payment"
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
                      colSpan="5" 
                      className="px-6 py-8 text-center text-gray-500 italic"
                    >
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={editingPayment ? handleEditSubmit : handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md relative"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {editingPayment ? "Edit Payment" : "Add New Payment"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingPayment(null); // Reset editing state on close
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-lg"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-gray-500" />
                Amount Paid
              </label>
              <input
                type="number"
                step="0.01"
                name="AmountPaid"
                value={formData.AmountPaid}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount paid"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-500" />
                Payment Date
              </label>
              <input
                type="datetime-local"
                name="PaymentDate"
                value={formData.PaymentDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                <FontAwesomeIcon icon={faFileInvoice} className="mr-2 text-gray-500" />
                Record Number
              </label>
              <input
                type="number"
                name="RecordNumber"
                value={formData.RecordNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter record number"
                // Assuming RecordNumber might be a unique identifier and not editable once created
                disabled={editingPayment ? true : false}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPayment(null); // Reset editing state on close
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={editingPayment ? faEdit : faPlus} />
                {editingPayment ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageUser;