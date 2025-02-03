import React, { useEffect, useState } from "react";
import Web3 from "web3";
import ElectionContract from "../abis/Election.json";
import { Container, TextField, Button, Typography, List, ListItem, ListItemText } from "@mui/material";

const ElectionApp = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState("");
  const [party, setParty] = useState("");

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = ElectionContract.networks[networkId];

        if (!deployedNetwork) {
            console.error("Contract not deployed to detected network");
            return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          ElectionContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setContract(contractInstance);
        loadCandidates(contractInstance);
      }
    };
    initWeb3();
  }, []);

  const loadCandidates = async (contractInstance) => {
    const candidatesCount = await contractInstance.methods.candidatesCount().call();
    const candidatesArray = [];
    for (let i = 1; i <= candidatesCount; i++) {
      const candidate = await contractInstance.methods.candidates(i).call();
      candidatesArray.push(candidate);
    }
    setCandidates(candidatesArray);
  };

  const registerCandidate = async () => {
    if (name && party) {
      await contract.methods.registerCandidate(name, party).send({ from: account });
      setName("");
      setParty("");
      loadCandidates(contract);
    }
  };

  const voteForCandidate = async (id) => {
    await contract.methods.vote(id).send({ from: account });
    loadCandidates(contract);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Election DApp - Owner</Typography>
      <TextField label="Candidate Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField label="Party" value={party} onChange={(e) => setParty(e.target.value)} fullWidth margin="normal" />
      <Button variant="contained" color="primary" onClick={registerCandidate}>Register Candidate</Button>
      <Typography variant="h5" gutterBottom style={{ marginTop: "20px" }}>Candidates</Typography>
      <List>
        {candidates.map((candidate, index) => (
          <ListItem key={index}>
            <ListItemText primary={`${candidate.name} (${candidate.party})`} secondary={`Votes: ${candidate.voteCount}`} />
            <Button variant="outlined" color="secondary" onClick={() => voteForCandidate(candidate.id)}>Vote</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ElectionApp;
