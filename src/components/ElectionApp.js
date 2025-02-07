import React, { useEffect, useState } from "react";
import Web3 from "web3";
import ElectionContract from "../abis/Election.json";
import { Container, TextField, Button, Typography, List, ListItem, ListItemText, Stack } from "@mui/material";

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
    if (!contract) {
        console.error("Smart contract is not initialized. Try refreshing the page.");
        return;
    }
    if (name && party) {
      await contract.methods.registerCandidate(name, party).send({ from: account });
      setName("");
      setParty("");
      loadCandidates(contract);
      console.log("Candidate " + name + " of the " + party + " party registered")
    }
  };

  const checkElectionStatus = async () => {
    if (contract) {
      const status = await contract.methods.electionStarted().call();
      console.log("Election Started:", status);
      return status;
    }
  };  

  const voteForCandidate = async (id) => {
    await contract.methods.vote(id).send({ from: account });
    loadCandidates(contract);
  };

  const toggleElection = async () => {
    if (!contract) {
        console.error("Smart contract is not initialized.");
        return;
    }
    try {
        const electionStatus = await contract.methods.electionStarted().call();
        if (electionStatus) {
          await contract.methods.endElection().send({ from: account });
          console.log("Election ended");
        } else {
          await contract.methods.startElection().send({ from: account });
          console.log("Election started");
        }
      } 
      catch (error) {
        console.error("Transaction failed: ", error);
    }
}

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Election DApp - Owner</Typography>
      <TextField label="Candidate Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField label="Party" value={party} onChange={(e) => setParty(e.target.value)} fullWidth margin="normal" />
      <Stack direction="row" spacing={10} justifyContent="center">
        <Button variant="contained" color="primary" onClick={registerCandidate}>Register Candidate</Button>
        <Button variant="contained" color="primary" onClick={toggleElection}>{checkElectionStatus() ? "End election" : "Start election"}</Button>
        </Stack>
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
