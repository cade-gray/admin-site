import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginProps } from "../interfaces/LoginPropsInterface";
import { downloadCsv } from "../lib/downloadCsv.ts";
import { jsonToCsv } from "../lib/jsonToCsv.ts";
import { logoutPost } from "../lib/logoutPost.ts";
const Guests: React.FC<LoginProps> = ({ loggedIn, setLoggedIn }) => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  useEffect(() => {
    if (loggedIn === false) {
      navigate("/");
    }
  }, [loggedIn, navigate]);

  useEffect(() => {
    const tokenString = sessionStorage.getItem("cg-admin-token");
    const { user, token } = JSON.parse(tokenString);
    // Fetch users from API
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.cadegray.dev/wedding/guests",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user }),
          }
        );
        // Prevent page from erroring from bad response
        if (!response.ok) {
          const responseCode = response.status;
          if (responseCode === 401) {
            logoutPost();
            sessionStorage.removeItem("cg-admin-token"); // Remove token since it does not exist in database
            setLoggedIn(false);
          }
          return;
        } else {
          const data = await response.json();
          setGuests(data);
        }
      } catch (error) {
        alert("error fetching guests: " + error);
      }
    };
    fetchData();
  }, [setLoggedIn]);

  const CsvDownloadButton = ({ guests }) => {
    const handleButtonClick = () => {
      // Convert JSON to CSV
      const csvData = jsonToCsv(guests);

      // Specify the filename for the downloaded CSV file
      const filename = "weddingGuests.csv";

      // Trigger the download using the imported function
      downloadCsv(csvData, filename);
    };
    return (
      <button
        className="bg-sky-500 p-2 rounded-md shadow-lg hover:scale-110 mt-2 mb-2"
        onClick={handleButtonClick}
      >
        Download as CSV
      </button>
    );
  };

  return (
    <div className="text-neutral-200 p-3">
      <h1 className="text-3xl font-mono">Guest List</h1>
      <CsvDownloadButton guests={guests} />
      <div className="overflow-x-auto">
        <table className="text-center min-w-max md:min-w-full">
          <thead className="bg-neutral-100 text-slate-700 text-sm">
            <tr>
              <th>GuestID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Attending</th>
              <th>Diet Restrictions</th>
              <th>Plus One</th>
              <th>Plus One Name</th>
              <th>Children</th>
              <th>Child Count</th>
            </tr>
          </thead>
          <tbody className="">
            {guests.map((guest) => (
              <tr key={guest.GuestID}>
                <td className="border px-1 py-1">{guest.GuestID}</td>
                <td className="border px-1 py-1">{guest.first_name}</td>
                <td className="border px-1 py-1">{guest.last_name}</td>
                <td className="border px-1 py-1">{guest.email}</td>
                <td className="border px-1 py-1">{guest.attending_yn}</td>
                <td className="border px-1 py-1">{guest.diet_rest}</td>
                <td className="border px-1 py-1">{guest.plus_one_yn}</td>
                <td className="border px-1 py-1">{guest.plus_one_name}</td>
                <td className="border px-1 py-1">{guest.children_yn}</td>
                <td className="border px-1 py-1">{guest.child_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Guests;
