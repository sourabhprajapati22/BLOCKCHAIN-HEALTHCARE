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
  const [queryResults, setQueryResults] = useState([]);


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

  // --- New States for Added Functions ---
  const [centralAssistantAddress, setCentralAssistantAddress] = useState("");
  const [centralAssistantName, setCentralAssistantName] = useState("");
  const [centralAssistantDob, setCentralAssistantDob] = useState("");

  const [doctorAssistantAddress, setDoctorAssistantAddress] = useState("");
  const [doctorAssistantName, setDoctorAssistantName] = useState("");
  const [doctorAssistantDob, setDoctorAssistantDob] = useState("");
  
  const [accessDoctorAddress, setAccessDoctorAddress] = useState("");

  const [assistantStatusAddress, setAssistantStatusAddress] = useState("");
  const [isAssistantActive, setIsAssistantActive] = useState(true);
  
  const [recordVisibilityId, setRecordVisibilityId] = useState("");
  const [isRecordPublic, setIsRecordPublic] = useState(false);


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
      await tx.wait();
      alert(successMessage);
    } catch (err) {
      console.error("Error:", err.message || err);
      alert("Transaction failed! Check console for details.");
    }
  };

  const handleViewCall = async (func, setter) => {
      if (!contract) return alert("Connect wallet first!");
      try {
          const result = await func();
          setter(result);
          console.log("Result:", result);
      } catch (err) {
          console.error("Error fetching data:", err);
          setter([]);
      }
  }


  // -------- Contract Write Functions ----------
  const addDoctor = () => handleContractCall(() => contract.addDoctor(doctorAddress, doctorName, parseInt(doctorDob)), "Doctor added!");
  const addPatient = () => handleContractCall(() => contract.addPatient(patientAddress, patientName, parseInt(patientDob)), "Patient added!");
  const addRecord = () => handleContractCall(() => contract.addRecord(recPatientAddress, diagnosis, treatment), "Record added!");
  const addCentralAssistant = () => handleContractCall(() => contract.addCentralAssistant(centralAssistantAddress, centralAssistantName, parseInt(centralAssistantDob)), "Central Assistant added!");
  const addDoctorAssistant = () => handleContractCall(() => contract.addDoctorAssistant(doctorAssistantAddress, doctorAssistantName, parseInt(doctorAssistantDob)), "Doctor Assistant added!");
  const grantAccess = () => handleContractCall(() => contract.grantAccess(accessDoctorAddress), "Access granted!");
  const revokeAccess = () => handleContractCall(() => contract.revokeAccess(accessDoctorAddress), "Access revoked!");
  const setAssistantStatus = () => handleContractCall(() => contract.setAssistantStatus(assistantStatusAddress, isAssistantActive), "Assistant status updated!");
  const setRecordVisibility = () => handleContractCall(() => contract.setRecordVisibility(recordVisibilityId, isRecordPublic), "Record visibility updated!");


  // -------- Contract View Functions ----------
  const getMyRecords = () => handleViewCall(() => contract.getMyRecords(), setRecords);
  const getPatientRecords = () => handleViewCall(() => contract.getPatientRecords(queryPatientAddress), setRecords);
  const getAllDoctors = () => handleViewCall(() => contract.getAllDoctors(), setAllDoctors);
  const getAllDoctorAssistants = () => handleViewCall(() => contract.getAllDoctorAssistants(), setAllAssistants);
  const getAnyPatientRecords = () => handleViewCall(() => contract.getAnyPatientRecords(queryPatientAddress), setQueryResults);
  

  // -------- UI ----------
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Healthcare DApp 🏥</h1>
      {account ? (
        <p>
          <b>Connected Account:</b> {account}
        </p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      <hr style={{ margin: "20px 0" }} />

      {/* ==================== OWNER/ADMIN FUNCTIONS ==================== */}
      <section>
        <h2>Owner/Admin Functions</h2>
        <div className="form-grid">
            {/* ---- Add Doctor Form ---- */}
            <div className="form-card">
              <h3>Add Doctor</h3>
              <input placeholder="Doctor Address" value={doctorAddress} onChange={(e) => setDoctorAddress(e.target.value)}/>
              <input placeholder="Doctor Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)}/>
              <input placeholder="DOB (YYYYMMDD)" value={doctorDob} onChange={(e) => setDoctorDob(e.target.value)}/>
              <button onClick={addDoctor}>Add Doctor</button>
            </div>

            {/* ---- Add Central Assistant ---- */}
            <div className="form-card">
              <h3>Add Central Assistant</h3>
              <input placeholder="Assistant Address" value={centralAssistantAddress} onChange={(e) => setCentralAssistantAddress(e.target.value)} />
              <input placeholder="Assistant Name" value={centralAssistantName} onChange={(e) => setCentralAssistantName(e.target.value)} />
              <input placeholder="DOB (YYYYMMDD)" value={centralAssistantDob} onChange={(e) => setCentralAssistantDob(e.target.value)} />
              <button onClick={addCentralAssistant}>Add Central Assistant</button>
            </div>
        </div>
      </section>
      <hr style={{ margin: "20px 0" }} />

      {/* ==================== DOCTOR FUNCTIONS ==================== */}
      <section>
        <h2>Doctor Functions</h2>
        <div className="form-grid">
            {/* ---- Add Patient Form ---- */}
            <div className="form-card">
              <h3>Add Patient</h3>
              <input placeholder="Patient Address" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)}/>
              <input placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)}/>
              <input placeholder="DOB (YYYYMMDD)" value={patientDob} onChange={(e) => setPatientDob(e.target.value)}/>
              <button onClick={addPatient}>Add Patient</button>
            </div>

            {/* ---- Add Record Form ---- */}
            <div className="form-card">
              <h3>Add Medical Record</h3>
              <input placeholder="Patient Address" value={recPatientAddress} onChange={(e) => setRecPatientAddress(e.target.value)}/>
              <input placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}/>
              <input placeholder="Treatment" value={treatment} onChange={(e) => setTreatment(e.target.value)}/>
              <button onClick={addRecord}>Add Record</button>
            </div>

            {/* ---- Add Doctor Assistant ---- */}
            <div className="form-card">
              <h3>Add Your Assistant</h3>
              <input placeholder="Assistant Address" value={doctorAssistantAddress} onChange={(e) => setDoctorAssistantAddress(e.target.value)} />
              <input placeholder="Assistant Name" value={doctorAssistantName} onChange={(e) => setDoctorAssistantName(e.target.value)} />
              <input placeholder="DOB (YYYYMMDD)" value={doctorAssistantDob} onChange={(e) => setDoctorAssistantDob(e.target.value)} />
              <button onClick={addDoctorAssistant}>Add Doctor Assistant</button>
            </div>

            {/* ---- Set Assistant Status ---- */}
            <div className="form-card">
              <h3>Set Assistant Status</h3>
              <input placeholder="Assistant Address" value={assistantStatusAddress} onChange={(e) => setAssistantStatusAddress(e.target.value)} />
              <label>
                <input type="checkbox" checked={isAssistantActive} onChange={(e) => setIsAssistantActive(e.target.checked)} />
                Is Active
              </label>
              <button onClick={setAssistantStatus}>Set Status</button>
            </div>
        </div>
      </section>
      <hr style={{ margin: "20px 0" }} />

      {/* ==================== PATIENT FUNCTIONS ==================== */}
      <section>
        <h2>Patient Access Control</h2>
         <div className="form-grid">
             {/* ---- Grant/Revoke Access ---- */}
            <div className="form-card">
              <h3>Manage Doctor Access</h3>
              <p>As a patient, you can grant or revoke a doctor's access to your records.</p>
              <input placeholder="Doctor Address" value={accessDoctorAddress} onChange={(e) => setAccessDoctorAddress(e.target.value)} />
              <button onClick={grantAccess} style={{ marginRight: '10px' }}>Grant Access</button>
              <button onClick={revokeAccess}>Revoke Access</button>
            </div>

             {/* ---- Set Record Visibility ---- */}
            <div className="form-card">
              <h3>Set Record Visibility</h3>
              <p>As a patient, you can make a specific record public for research purposes.</p>
              <input placeholder="Record ID" value={recordVisibilityId} onChange={(e) => setRecordVisibilityId(e.target.value)} />
              <label>
                <input type="checkbox" checked={isRecordPublic} onChange={(e) => setIsRecordPublic(e.target.checked)} />
                Make Public
              </label>
              <button onClick={setRecordVisibility}>Set Visibility</button>
            </div>
         </div>
      </section>
      <hr style={{ margin: "20px 0" }} />

      {/* ==================== DATA QUERIES ==================== */}
      <section>
        <h2>Data Queries</h2>
         {/* ---- Query Records ---- */}
        <h3>Get Medical Records</h3>
        <div className="form-card">
            <button onClick={getMyRecords}>Get My Records (Patient View)</button>
            <br /><br />
            <input placeholder="Patient Address" value={queryPatientAddress} onChange={(e) => setQueryPatientAddress(e.target.value)} />
            <button onClick={getPatientRecords} style={{ marginLeft: '10px' }}>Get Patient Records (Doctor View)</button>
             <button onClick={getAnyPatientRecords} style={{ marginLeft: '10px' }}>Get Patient Public Records (Anyone)</button>
        </div>

        <h3>Records List:</h3>
        {records.length > 0 ? (
          <ul>
            {records.map((rec, idx) => (
              <li key={idx}>
                <b>ID:</b> {rec.recordId.toString()} | <b>Diagnosis:</b>{" "}
                {rec.diagnosis} | <b>Treatment:</b> {rec.treatment} | <b>By:</b>{" "}
                {rec.createdBy}
              </li>
            ))}
          </ul>
        ) : (
          <p>No records found.</p>
        )}

        {/* ---- General Lists ---- */}
        <div className="form-card">
            <h3>Get General Lists</h3>
            <button onClick={getAllDoctors} style={{ marginRight: '10px' }}>Get All Doctors</button>
            <button onClick={getAllDoctorAssistants}>Get All Doctor Assistants</button>
            
            {allDoctors.length > 0 && <div><h4>Doctors:</h4><ul>{allDoctors.map(d => <li key={d}>{d}</li>)}</ul></div>}
            {allAssistants.length > 0 && <div><h4>Assistants:</h4><ul>{allAssistants.map(a => <li key={a}>{a}</li>)}</ul></div>}
        </div>
        
         {/* ---- Display Other Query Results ---- */}
        {queryResults.length > 0 && (
            <div className="form-card">
                <h3>Public Records Found:</h3>
                <ul>
                {queryResults.map((rec, idx) => (
                  <li key={idx}>
                    <b>ID:</b> {rec.recordId.toString()} | <b>Diagnosis:</b> {rec.diagnosis} | <b>By:</b> {rec.createdBy}
                  </li>
                ))}
              </ul>
            </div>
        )}
      </section>
      
      {/* Basic Styling */}
      <style>{`
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .form-card { border: 1px solid #ccc; border-radius: 8px; padding: 16px; }
        input { display: block; width: calc(100% - 20px); padding: 8px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #ccc; }
        button { background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #0056b3; }
        h1, h2, h3 { color: #333; }
        hr { border: 0; height: 1px; background: #ddd; }
        section { margin-bottom: 20px; }
      `}</style>
    </div>
  );
}

export default App;