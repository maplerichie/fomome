const { time, mine } = require('@nomicfoundation/hardhat-network-helpers');

async function main() {
    console.log("Before: ", await time.latest());
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
    console.log("After: ", await time.latest());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
