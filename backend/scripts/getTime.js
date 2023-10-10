const { time, mine } = require('@nomicfoundation/hardhat-network-helpers');

async function main() {
    await mine(1);
    const timestamp = await time.latest();
    console.log(timestamp);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
