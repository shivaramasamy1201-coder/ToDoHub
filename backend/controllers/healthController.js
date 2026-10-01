/**
 * Health Controller
 * Simple health check handler
 */
export const getHealthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'ToDoHub API is running'
  });
};
