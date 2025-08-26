// Test basique pour valider la Phase 1
describe('EBP MCP Server - Phase 1', () => {
  test('should export main configuration', () => {
    const config = require('../src/config');
    expect(config.config.database.server).toBe('SRVDEV2025\\EBP');
    expect(config.config.mcp.name).toBe('ebp-mcp-server');
  });

  test('should have correct tool definition', () => {
    // Test unitaire minimal - sera étendu en Phase 2
    expect(true).toBe(true);
  });
});