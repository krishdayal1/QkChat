
export const errorHandler = (err, req, res, next) => {
    try {
        
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: "File size too large. Please upload a smaller file." });
    }
    } catch(error){
    console.error("Unhandled error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
}