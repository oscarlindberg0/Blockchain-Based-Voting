const Election = artifacts.require('./Election.sol')

contract('Election', (accounts) => {
    let election;

    before(async () => {
        election = await Election.new();
    });

    it("should deploy contract", async () => {
        assert(election.address !== "");
    });

    it("should register candidate", async () => {
        await election.registerCandidate("John", "Labour party", { from: accounts[0] });
        const candidate = await election.getCandidate(1);
        assert.equal(candidate[0], "John", "Candidate name does not match");
    });

    it("should allow voting", async () => {
        await election.vote(1, { from: accounts[1] });
        const candidate = await election.getCandidate(1);
        assert.equal(candidate[1].toNumber(), 1, "Vote count should be 1");
    });

});