export const healthCheck = (req, res) => {
    try {
        res.status(200).json({
            status: "success",
            message: "Health is good",
        });
    } catch (err) {
        console.error("You got the error:", err);

        res.status(500).json({
            status: "fail",
            message: err.message,
        });
    }
};
