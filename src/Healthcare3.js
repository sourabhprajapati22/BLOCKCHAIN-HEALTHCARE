import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "./abi.json"; // ✅ your ABI file

// Replace with your deployed contract address
const contractAddress = "0x46dd2d2500d038c89289f8f98d373d6a97080dd8";

function App() {
  // ----------- Connection & Contract States -----------
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  // ----------- UI Data States -----------
  const [records, setRecords] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allAssistants, setAllAssistants] = useState([]);
  const [myAssistants, setMyAssistants] = useState([]);

  // --- New states for general lookups ---
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupResult, setLookupResult] = useState(null);


  // ----------- Form Input States -----------
  const [doctorAddress, setDoctorAddress] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorDob, setDoctorDob] = useState("");

  const [patientAddress, setPatientAddress] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientDob, setPatientDob] = useState("");

  const [recPatientAddress, setRecPatientAddress] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  const [queryPatientAddress, setQueryPatientAddress] = useState("");

  // --- States for Added Functions ---
  const [centralAssistantAddress, setCentralAssistantAddress] = useState("");
  const [centralAssistantName, setCentralAssistantName] = useState("");
  const [centralAssistantDob, setCentralAssistantDob] = useState("");

  const [doctorAssistantAddress, setDoctorAssistantAddress] = useState("");
  const [doctorAssistantName, setDoctorAssistantName] = useState("");
  const [doctorAssistantDob, setDoctorAssistantDob] = useState("");
  
  const [accessDoctorAddress, setAccessDoctorAddress] = useState("");

  const [assistantStatusAddress, setAssistantStatusAddress] = useState("");
  const [isAssistantActive, setIsAssistantActive] = useState(true);

  const [centralAssistantStatusAddress, setCentralAssistantStatusAddress] = useState("");
  const [isCentralAssistantActive, setIsCentralAssistantActive] = useState(true);
  
  const [recordVisibilityId, setRecordVisibilityId] = useState("");
  const [isRecordPublic, setIsRecordPublic] = useState(true);


  // -------- Connect & Listeners ----------
  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not installed!");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(address);
      localStorage.setItem("isWalletConnected", "true");
      console.log("Wallet connected:", address);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (localStorage.getItem("isWalletConnected") === "true" && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            setProvider(provider);
            setSigner(signer);
            setContract(contract);
            setAccount(accounts[0]);
            console.log("Auto-connected:", accounts[0]);
          } else {
            localStorage.removeItem("isWalletConnected");
          }
        } catch (err) {
          console.error("Auto-connect failed:", err);
        }
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        console.log("Account changed:", accounts[0]);
        connectWallet(); // Re-initialize signer and contract
      } else {
        setAccount(null);
        setSigner(null);
        setContract(null);
        localStorage.removeItem("isWalletConnected");
      }
    };
    const handleChainChanged = (_chainId) => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // -------- Helper for Contract Calls --------
  const handleContractCall = async (func, successMessage) => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const tx = await func();
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed.");
      alert(successMessage);
    } catch (err) {
      const errorMessage = err.reason || err.message || "An unknown error occurred.";
      console.error("Transaction Error:", errorMessage);
      alert(`Transaction failed: ${errorMessage}`);
    }
  };

  const handleViewCall = async (func, setter) => {
      if (!contract) return alert("Connect wallet first!");
      try {
          const result = await func();
          setter(result);
          console.log("View call result:", result);
      } catch (err) {
          console.error("Error fetching data:", err);
          setter(null); // Set to null or an appropriate empty state
      }
  }

  // -------- Contract Write Functions ----------
  const addCentralAssistant = () => handleContractCall(() => contract.addCentralAssistant(centralAssistantAddress, centralAssistantName, parseInt(centralAssistantDob)), "Central Assistant added!");
  const addDoctor = () => handleContractCall(() => contract.addDoctor(doctorAddress, doctorName, parseInt(doctorDob)), "Doctor added!");
  const addDoctorAssistant = () => handleContractCall(() => contract.addDoctorAssistant(doctorAssistantAddress, doctorAssistantName, parseInt(doctorAssistantDob)), "Doctor Assistant added!");
  const addPatient = () => handleContractCall(() => contract.addPatient(patientAddress, patientName, parseInt(patientDob)), "Patient added!");
  const addRecord = () => handleContractCall(() => contract.addRecord(recPatientAddress, diagnosis, treatment), "Record added!");
  
  const grantAccess = () => handleContractCall(() => contract.grantAccess(accessDoctorAddress), "Access granted!");
  const revokeAccess = () => handleContractCall(() => contract.revokeAccess(accessDoctorAddress), "Access revoked!");
  
  const setCentralAssistantStatus = () => handleContractCall(() => contract.setCentralAssistantStatus(centralAssistantStatusAddress, isCentralAssistantActive), "Central Assistant status updated!");
  const setAssistantStatus = () => handleContractCall(() => contract.setAssistantStatus(assistantStatusAddress, isAssistantActive), "Doctor's Assistant status updated!");
  const setRecordVisibility = () => handleContractCall(() => contract.setRecordVisibility(recordVisibilityId, isRecordPublic), "Record visibility updated!");


  // -------- Contract View Functions ----------
  const getMyRecords = () => handleViewCall(contract.getMyRecords, setRecords);
  const getPatientRecords = () => handleViewCall(() => contract.getPatientRecords(queryPatientAddress), setRecords);
  const getAnyPatientRecords = () => handleViewCall(() => contract.getAnyPatientRecords(queryPatientAddress), setRecords);
  const getAllDoctors = () => handleViewCall(contract.getAllDoctors, setAllDoctors);
  const getAllDoctorAssistants = () => handleViewCall(contract.getAllDoctorAssistants, setAllAssistants);
  const getMyAssistants = () => handleViewCall(contract.getMyAssistants, setMyAssistants);
  
  // --- New view functions for lookups ---
  const checkIsDoctor = () => handleViewCall(() => contract.isDoctor(lookupAddress), (res) => setLookupResult(`Is Doctor: ${res}`));
  const checkIsDoctorAssistant = () => handleViewCall(() => contract.isDoctorAssistant(lookupAddress), (res) => setLookupResult(`Is Doctor Assistant: ${res}`));
  const checkIsPatient = () => handleViewCall(() => contract.isPatient(lookupAddress), (res) => setLookupResult(`Is Patient: ${res}`));
  const getOwner = () => handleViewCall(contract.owner, (res) => setLookupResult(`Owner: ${res}`));
  const getProfile = () => handleViewCall(() => contract.profiles(lookupAddress), (res) => setLookupResult(res.exists ? `Name: ${res.name}, DOB: ${res.dateOfBirth.toString()}` : "Profile does not exist."));
  const getPatientInfo = () => handleViewCall(() => contract.patientInfo(lookupAddress), (res) => setLookupResult(res.patientAddress === ethers.constants.AddressZero ? "Not a patient." : `Primary Doctor: ${res.primaryDoctor}`));
  const getDoctorAssistantInfo = () => handleViewCall(() => contract.doctorAssistantInfo(lookupAddress), (res) => setLookupResult(res.assistantAddress === ethers.constants.AddressZero ? "Not a doctor assistant." : `Assigned Doctor: ${res.assignedDoctor}, Active: ${res.isActive}`));

  // -------- UI ----------
  return (
    <div className="container">
      <h1>Healthcare Records DApp 🏥</h1>
      {account ? (
        <p className="account-info">
          <b>Connected Account:</b> {account}
        </p>
      ) : (
        <button className="connect-button" onClick={connectWallet}>Connect Wallet</button>
      )}
      <hr />

      {/* ==================== SUPER ADMIN (OWNER ONLY) ==================== */}
      <section>
        <h2>Super Admin (Owner Only)</h2>
        <div className="form-grid">
          <div className="form-card">
            <h3>Add Central Assistant</h3>
            <input placeholder="Assistant Address" value={centralAssistantAddress} onChange={(e) => setCentralAssistantAddress(e.target.value)} />
            <input placeholder="Assistant Name" value={centralAssistantName} onChange={(e) => setCentralAssistantName(e.target.value)} />
            <input type="number" placeholder="DOB (YYYYMMDD)" value={centralAssistantDob} onChange={(e) => setCentralAssistantDob(e.target.value)} />
            <button onClick={addCentralAssistant}>Add Central Assistant</button>
          </div>
          <div className="form-card">
            <h3>Set Central Assistant Status</h3>
            <input placeholder="Assistant Address" value={centralAssistantStatusAddress} onChange={(e) => setCentralAssistantStatusAddress(e.target.value)} />
            <label>
              <input type="checkbox" checked={isCentralAssistantActive} onChange={(e) => setIsCentralAssistantActive(e.target.checked)} />
              Is Active
            </label>
            <button onClick={setCentralAssistantStatus}>Set Status</button>
          </div>
        </div>
      </section>
      <hr />

      {/* ==================== ADMIN (OWNER/CENTRAL ASST.) ==================== */}
      <section>
        <h2>Admin (Owner/Central Asst.)</h2>
        <div className="form-grid">
          <div className="form-card">
            <h3>Add Doctor</h3>
            <input placeholder="Doctor Address" value={doctorAddress} onChange={(e) => setDoctorAddress(e.target.value)}/>
            <input placeholder="Doctor Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)}/>
            <input type="number" placeholder="DOB (YYYYMMDD)" value={doctorDob} onChange={(e) => setDoctorDob(e.target.value)}/>
            <button onClick={addDoctor}>Add Doctor</button>
          </div>
        </div>
      </section>
      <hr />

      {/* ==================== DOCTOR/ASST. FUNCTIONS ==================== */}
      <section>
        <h2>Doctor/Asst. Functions</h2>
        <div className="form-grid">
          <div className="form-card">
            <h3>Add Your Assistant (Doctor Only)</h3>
            <input placeholder="Assistant Address" value={doctorAssistantAddress} onChange={(e) => setDoctorAssistantAddress(e.target.value)} />
            <input placeholder="Assistant Name" value={doctorAssistantName} onChange={(e) => setDoctorAssistantName(e.target.value)} />
            <input type="number" placeholder="DOB (YYYYMMDD)" value={doctorAssistantDob} onChange={(e) => setDoctorAssistantDob(e.target.value)} />
            <button onClick={addDoctorAssistant}>Add Doctor Assistant</button>
          </div>
          <div className="form-card">
            <h3>Set Your Assistant's Status (Doctor Only)</h3>
            <input placeholder="Assistant Address" value={assistantStatusAddress} onChange={(e) => setAssistantStatusAddress(e.target.value)} />
            <label>
              <input type="checkbox" checked={isAssistantActive} onChange={(e) => setIsAssistantActive(e.target.checked)} />
              Is Active
            </label>
            <button onClick={setAssistantStatus}>Set Status</button>
          </div>
          <div className="form-card">
            <h3>Add Patient</h3>
            <input placeholder="Patient Address" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)}/>
            <input placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)}/>
            <input type="number" placeholder="DOB (YYYYMMDD)" value={patientDob} onChange={(e) => setPatientDob(e.target.value)}/>
            <button onClick={addPatient}>Add Patient</button>
          </div>
          <div className="form-card">
            <h3>Add Medical Record</h3>
            <input placeholder="Patient Address" value={recPatientAddress} onChange={(e) => setRecPatientAddress(e.target.value)}/>
            <input placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}/>
            <input placeholder="Treatment" value={treatment} onChange={(e) => setTreatment(e.target.value)}/>
            <button onClick={addRecord}>Add Record</button>
          </div>
        </div>
      </section>
      <hr />

      {/* ==================== PATIENT FUNCTIONS ==================== */}
      <section>
        <h2>Patient Functions</h2>
        <div className="form-grid">
          <div className="form-card">
            <h3>Manage Doctor Access</h3>
            <p>Grant or revoke a doctor's access to your records.</p>
            <input placeholder="Doctor Address" value={accessDoctorAddress} onChange={(e) => setAccessDoctorAddress(e.target.value)} />
            <button onClick={grantAccess}>Grant Access</button>
            <button onClick={revokeAccess}>Revoke Access</button>
          </div>
          <div className="form-card">
            <h3>Set Record Visibility</h3>
            <p>Make a specific record public or private.</p>
            <input type="number" placeholder="Record ID" value={recordVisibilityId} onChange={(e) => setRecordVisibilityId(e.target.value)} />
            <label>
              <input type="checkbox" checked={isRecordPublic} onChange={(e) => setIsRecordPublic(e.target.checked)} />
              Make Public
            </label>
            <button onClick={setRecordVisibility}>Set Visibility</button>
          </div>
        </div>
      </section>
      <hr />

      {/* ==================== DATA QUERIES & LISTS ==================== */}
      <section>
        <h2>Data Queries & Lists</h2>
        <div className="form-card">
          <h3>Get Medical Records</h3>
          <button onClick={getMyRecords}>Get My Records (Patient)</button>
          <div className="inline-form">
            <input placeholder="Patient Address" value={queryPatientAddress} onChange={(e) => setQueryPatientAddress(e.target.value)} />
            <button onClick={getPatientRecords}>Get Patient Records (Doctor/Asst.)</button>
            <button onClick={getAnyPatientRecords}>Get Any Patient Records (Owner)</button>
          </div>
          <div className="results-box">
            <h4>Records List:</h4>
            {records && records.length > 0 ? (
              <ul>
                {records.map((rec, idx) => (
                  <li key={idx}>
                    <b>ID:</b> {rec.recordId.toString()} | <b>Diagnosis:</b> {rec.diagnosis} | <b>Treatment:</b> {rec.treatment} | <b>By:</b> {rec.createdBy.slice(0, 6)}... | <b>Public:</b> {rec.isPublic.toString()}
                  </li>
                ))}
              </ul>
            ) : (<p>No records to display.</p>)}
          </div>
        </div>

        <div className="form-grid">
            <div className="form-card">
                <h3>Get Professional Lists</h3>
                <button onClick={getAllDoctors}>Get All Doctors</button>
                <button onClick={getAllDoctorAssistants}>Get All Doctor Assistants</button>
                <button onClick={getMyAssistants}>Get My Assistants (Doctor)</button>
                {allDoctors && allDoctors.length > 0 && <div className="results-box"><h4>All Doctors:</h4><ul>{allDoctors.map(d => <li key={d}>{d}</li>)}</ul></div>}
                {allAssistants && allAssistants.length > 0 && <div className="results-box"><h4>All Doctor Assistants:</h4><ul>{allAssistants.map(a => <li key={a}>{a}</li>)}</ul></div>}
                {myAssistants && myAssistants.length > 0 && <div className="results-box"><h4>My Assistants:</h4><ul>{myAssistants.map(a => <li key={a}>{a}</li>)}</ul></div>}
            </div>
        </div>
      </section>
      <hr />

      {/* ==================== GENERAL LOOKUPS ==================== */}
      <section>
        <h2>General Lookups</h2>
        <div className="form-card">
          <h3>Check Info for any Address</h3>
          <input placeholder="Enter any Ethereum Address" value={lookupAddress} onChange={(e) => setLookupAddress(e.target.value)} />
          <div className="button-group">
            <button onClick={getOwner}>Get Owner</button>
            <button onClick={getProfile}>Get Profile</button>
            <button onClick={checkIsDoctor}>Is Doctor?</button>
            <button onClick={checkIsDoctorAssistant}>Is Doc Asst?</button>
            <button onClick={checkIsPatient}>Is Patient?</button>
            <button onClick={getPatientInfo}>Get Patient Info</button>
            <button onClick={getDoctorAssistantInfo}>Get Doc Asst Info</button>
          </div>
          {lookupResult && (
            <div className="results-box">
              <h4>Lookup Result:</h4>
              <p>{lookupResult}</p>
            </div>
          )}
        </div>
      </section>

      {/* --- STYLES --- */}
      <style>{`
        body { background-color: #f4f7f6; color: #333; }
        .container { max-width: 1200px; margin: auto; padding: 20px; }
        .account-info { background-color: #eef; padding: 10px; border-radius: 8px; border: 1px solid #cce; font-family: monospace; }
        .connect-button { font-size: 16px; padding: 12px 20px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
        .form-card { background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        input[type="text"], input[type="number"] { display: block; width: calc(100% - 22px); padding: 10px; margin-bottom: 12px; border-radius: 4px; border: 1px solid #ccc; font-size: 14px; }
        label { display: flex; align-items: center; margin-bottom: 12px; }
        input[type="checkbox"] { margin-right: 8px; }
        button { background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-right: 10px; margin-top: 5px; }
        button:hover { background-color: #0056b3; }
        h1, h2, h3 { color: #0056b3; border-bottom: 2px solid #eee; padding-bottom: 5px; }
        h1 { text-align: center; }
        hr { border: 0; height: 1px; background: #ddd; margin: 30px 0; }
        section { margin-bottom: 30px; }
        .inline-form { display: flex; align-items: center; gap: 10px; margin-top: 15px; }
        .inline-form input { margin-bottom: 0; }
        .results-box { background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; margin-top: 15px; padding: 15px; }
        .results-box h4 { margin-top: 0; }
        .results-box ul { padding-left: 20px; margin-bottom: 0; }
        .button-group { margin-top: 10px; }
      `}</style>
    </div>
  );
}

export default App;