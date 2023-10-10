const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FoMoMe", function () {
    let fomome;
    let accounts;

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        const FoMoMe = await ethers.getContractFactory("FoMoMe");
        fomome = await FoMoMe.deploy();
        await fomome.deployed();
    });

    it("should not able to join before start", async () => {
        const [host, player] = accounts;
        const entryPrice = ethers.utils.parseUnits("0.01", "ether");

        await expect(fomome.connect(player).join(host.address, { value: entryPrice })).to.be.revertedWith("No game yet");
    });

    it("should not start a game before previous ended", async () => {
        const host = accounts[0];
        const entryPrice = ethers.utils.parseUnits("0.01", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        await expect(fomome.connect(host).start(entryPrice, { value: entryPrice })).to.be.revertedWith("End the previous game first");
    });

    it("should start with valid entry price", async () => {
        const host = accounts[0];
        let entryPrice = ethers.utils.parseUnits("0.005", "ether");

        await expect(fomome.connect(host).start(entryPrice)).to.be.revertedWith("Pay the entry price");

        await expect(fomome.connect(host).start(entryPrice, { value: entryPrice })).to.be.revertedWith("Entry price at least 0.01 ETH");

        entryPrice = ethers.utils.parseUnits("10", "ether");
        expect(await fomome.connect(host).start(entryPrice, { value: entryPrice })).to.be.ok;
    });

    it("should start a game and allow a user to join", async () => {
        const [host, player] = accounts;
        const entryPrice = ethers.utils.parseUnits("0.01", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        let game = await fomome.getActiveGame(host.address);
        expect(game.deadline).to.be.gt(0);

        await fomome.connect(player).join(host.address, { value: entryPrice });

        game = await fomome.getActiveGame(host.address);
        expect(game.prize).to.equal(entryPrice.mul(2));
    });

    it("should join with valid entry price", async () => {
        const [host, player] = accounts;
        let entryPrice = ethers.utils.parseUnits("1", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        await expect(fomome.connect(player).join(host.address, { value: ethers.utils.parseUnits("0.99", "ether") })).to.be.revertedWith("Entry price not met");

        expect(await fomome.connect(player).join(host.address, { value: entryPrice })).to.be.ok;

        expect(await fomome.connect(player).join(host.address, { value: entryPrice.mul(2) })).to.be.ok;

        game = await fomome.getActiveGame(host.address);
        expect(game.prize).to.equal(entryPrice.mul(4));
    });

    it("should can join with any amount above entry price", async () => {
        const [host] = accounts;

        const entryPrice = ethers.utils.parseUnits("1", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        for (let i = 1; i < 10; i++) {
            let entryAmount = ethers.utils.parseUnits((Math.random() * 99 + 1).toString(), "ether");
            expect(await fomome.connect(accounts[i]).join(host.address, { value: entryAmount })).to.be.ok;
        }
    });

    it("should prevent joining after the game met deadline", async () => {
        const [host, player] = accounts;
        const entryPrice = ethers.utils.parseUnits("0.01", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        await advanceTime(3601);

        await expect(fomome.connect(player).join(host.address, { value: entryPrice })).to.be.revertedWith("The game is over");
    });

    it("should prevent claiming before the game start", async () => {
        const [host, player] = accounts;

        await expect(fomome.connect(player).conclude(host.address)).to.be.revertedWith("No game yet");

        await advanceTime(1000);

        await expect(fomome.connect(player).conclude(host.address)).to.be.revertedWith("No game yet");
    });

    it("should prevent claiming before the game met deadline", async () => {
        const [host, player] = accounts;
        const entryPrice = ethers.utils.parseUnits("0.01", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        expect(await fomome.connect(player).join(host.address, { value: entryPrice })).to.be.ok;

        await advanceTime(3601);

        await expect(fomome.connect(player).conclude(host.address)).to.be.revertedWith("The game is not over yet");

        await advanceTime(600);

        expect(await fomome.connect(player).conclude(host.address)).to.be.ok;
    });

    it("should claim after the game met deadline", async () => {
        const [owner, host, player1, player2, player3, player4, player5] = accounts;

        const entryPrice = ethers.utils.parseUnits("1", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        expect(await fomome.connect(player1).join(host.address, { value: entryPrice.mul(2) })).to.be.ok;
        expect(await fomome.connect(player2).join(host.address, { value: entryPrice.mul(3) })).to.be.ok;
        expect(await fomome.connect(player3).join(host.address, { value: entryPrice.mul(4) })).to.be.ok;
        expect(await fomome.connect(player4).join(host.address, { value: entryPrice.mul(5) })).to.be.ok;
        expect(await fomome.connect(player5).join(host.address, { value: entryPrice.mul(6) })).to.be.ok;
        expect(await fomome.connect(player1).join(host.address, { value: entryPrice })).to.be.ok;

        let game = await fomome.getActiveGame(host.address);
        let prize = game.prize;
        expect(prize).to.equal(entryPrice.mul(22));
        await advanceTime(3601 + (600 * 21));

        expect(await fomome.connect(player5).conclude(host.address)).to.changeEtherBalances([player1, player5, host, owner], [prize.div(100).mul(95), prize.div(100).mul(3), prize.div(100).mul(2), prize.div(100).mul(1)]);
    });

    it("should claim with players join with any amount above entry price", async () => {
        const [owner, host, player1, player2, player3, player4, player5] = accounts;

        const entryPrice = ethers.utils.parseUnits("1", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        for (let i = 1; i < 10; i++) {
            let entryAmount = ethers.utils.parseUnits((Math.random() * 99 + 1).toString(), "ether");
            expect(await fomome.connect(accounts[i]).join(host.address, { value: entryAmount })).to.be.ok;
        }
        let game = await fomome.getActiveGame(host.address);
        let prize = game.prize;
        await advanceTime(1000000);

        expect(await fomome.connect(player5).conclude(host.address)).to.changeEtherBalances([player1, player5, host, owner], [prize.div(100).mul(95), prize.div(100).mul(3), prize.div(100).mul(2), prize.div(100).mul(1)]);
    });

    it("should prevent joining after the game has ended", async () => {
        const [host, player] = accounts;

        const entryPrice = ethers.utils.parseUnits("0.01", "ether");

        await fomome.connect(host).start(entryPrice, { value: entryPrice });

        expect(await fomome.connect(player).join(host.address, { value: entryPrice })).to.be.ok;

        await advanceTime(4201);

        expect(await fomome.connect(player).conclude(host.address)).to.be.ok;

        await expect(fomome.connect(player).join(host.address, { value: entryPrice })).to.be.revertedWith("No game yet");
    });

    it("should get only active hosts", async () => {
        const [host0, host1, host2, host3, host4] = accounts;

        const entryPrice = ethers.utils.parseUnits("1", "ether");

        expect(await fomome.connect(host0).start(entryPrice, { value: entryPrice })).to.be.ok;
        expect(await fomome.connect(host1).start(entryPrice, { value: entryPrice })).to.be.ok;
        expect(await fomome.connect(host2).start(entryPrice, { value: entryPrice })).to.be.ok;
        expect(await fomome.connect(host3).start(entryPrice, { value: entryPrice })).to.be.ok;
        expect(await fomome.connect(host4).start(entryPrice, { value: entryPrice })).to.be.ok;

        await advanceTime(4201);
        expect(await fomome.connect(host0).conclude(host4.address)).to.be.ok;

        expect(await fomome.getActiveHosts()).to.eqls([host0.address, host1.address, host2.address, host3.address]);
    });

    async function advanceTime(seconds) {
        await network.provider.send("evm_increaseTime", [seconds]);
        await network.provider.send("evm_mine");
    }
});