const sendError = (res, statusCode, message, errorDetails = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        error: errorDetails 
            ? (typeof errorDetails === "object" && errorDetails.message) 
                ? errorDetails.message  // Extracts error message
                : errorDetails 
            : null, // Avoids empty object
    });
};

export default sendError;
