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
        const candidate = await election.getCandidate(0);
        assert.equal(candidate[0], "John", "Candidate name does not match");
    });

    it("should not let non-owner register candidate", async () => {
        try {
            await election.registerCandidate("James", "Liberal party", { from: accounts[1] });
            assert.fail("transaction should have failed");
        } catch (error) {
            assert(error.message.includes("Only owner can perform this action"), "Expected owner-only restriction error");
        }
    });

    it("should allow voting", async () => {
        await election.vote(0, { from: accounts[1] });
        const candidate = await election.getCandidate(0);
        assert.equal(candidate[1].toNumber(), 1, "Vote count should be 1");
    });

});