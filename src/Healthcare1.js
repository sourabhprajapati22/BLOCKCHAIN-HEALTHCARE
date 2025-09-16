import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "./abi.json"; // ✅ your ABI file

// Replace with your deployed contract address
const contractAddress = "0x46dd2d2500d038c89289f8f98d373d6a97080dd8";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [records, setRecords] = useState([]);

  // -------- Connect Wallet ----------
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed!");
      return;
    }

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

  // -------- Auto reconnect ----------
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

  // -------- Handle MetaMask events ----------
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        console.log("Account changed:", accounts[0]);
      } else {
        // Disconnected
        setAccount(null);
        setSigner(null);
        setContract(null);
        localStorage.removeItem("isWalletConnected");
      }
    };

    const handleChainChanged = (_chainId) => {
      console.log("Chain changed to:", _chainId);
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // -------- Example Functions ----------
  const addDoctor = async (doctorAddress, name, dob) => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const tx = await contract.addDoctor(doctorAddress, name, dob);
      await tx.wait();
      alert("Doctor added!");
    } catch (err) {
      console.error("Error adding doctor:", err);
    }
  };

  const addPatient = async (patientAddress, name, dob) => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const tx = await contract.addPatient(patientAddress, name, dob);
      await tx.wait();
      alert("Patient added!");
    } catch (err) {
      console.error("Error adding patient:", err);
    }
  };

  const addRecord = async (patientAddress, diagnosis, treatment) => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const tx = await contract.addRecord(patientAddress, diagnosis, treatment);
      await tx.wait();
      alert("Record added!");
    } catch (err) {
      console.error("Error adding record:", err);
    }
  };

  const getMyRecords = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const result = await contract.getMyRecords();
      setRecords(result);
      console.log("My Records:", result);
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  const getPatientRecords = async (patientAddress) => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const result = await contract.getPatientRecords(patientAddress);
      setRecords(result);
      console.log("Patient Records:", result);
    } catch (err) {
      console.error("Error fetching patient records:", err);
    }
  };

  // -------- UI ----------
  return (
    <div style={{ padding: "20px" }}>
      <h2>Healthcare DApp</h2>

      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      <hr />

      {/* Example Actions */}
      <button
        onClick={() =>
          addDoctor("0x0000000000000000000000000000000000000000", "Dr. Strange", 19800101)
        }
      >
        Add Doctor (Example)
      </button>

      <button
        onClick={() =>
          addPatient("0x0000000000000000000000000000000000000000", "Alice", 19950101)
        }
      >
        Add Patient (Example)
      </button>

      <button
        onClick={() =>
          addRecord("0x0000000000000000000000000000000000000000", "Flu", "Rest & Medicine")
        }
      >
        Add Record (Example)
      </button>

      <hr />

      <button onClick={getMyRecords}>Get My Records</button>
      <button
        onClick={() =>
          getPatientRecords("0x0000000000000000000000000000000000000000")
        }
      >
        Get Patient Records (Example)
      </button>

      <h3>Records:</h3>
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
    </div>
  );
}

export default App;
