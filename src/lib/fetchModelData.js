/**
 * Fetch model data from the server.
 *
 * @param {string} endpoint The API endpoint to fetch data from.
 * @returns {Promise} A promise that resolves with the fetched model data or rejects with an error.
 */
export async function fetchModel(endpoint) {
  try {
    const response = await fetch(`https://localhost:8081${endpoint}`);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}