const { ethers } = require('hardhat');
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer, player1, player2, player3, player4, player5] = await ethers.getSigners();

    console.log(`Deploying contracts with the account: ${deployer.address}`);

    const FoMoMe = await ethers.getContractFactory('FoMoMe');
    const fomome = await FoMoMe.deploy();

    await fomome.deployed();

    console.log(`FoMoMe address: ${fomome.address}`);

    // const entryPrice = ethers.utils.parseUnits("1", "ether");
    // await fomome.connect(player1).start(entryPrice, { value: entryPrice });
    // await fomome.connect(player2).start(entryPrice, { value: entryPrice });
    // await fomome.connect(player3).start(entryPrice, { value: entryPrice });
    // await fomome.connect(player4).start(entryPrice, { value: entryPrice });
    // await fomome.connect(player5).start(entryPrice, { value: entryPrice });

    // const hosts = await fomome.getActiveHosts();
    // console.log("Active hosts:", hosts);
    // console.log("Game #1", await fomome.getActiveGame(hosts[1]));

    const directoryPath = path.join(__dirname, "../../frontend/data");
    const jsonFilePath = path.join(directoryPath, "deployed.json");
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
    fs.writeFileSync(jsonFilePath, JSON.stringify({
        "FoMoMe": fomome.address
    }));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
