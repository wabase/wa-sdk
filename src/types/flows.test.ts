import { describe, it, expect } from 'vitest';
import type { FlowDeprecationResponse } from './flows.js';

describe('Flow Deprecation Types', () => {
  it('should accept valid FlowDeprecationResponse', () => {
    const response: FlowDeprecationResponse = {
      success: true,
      flow_id: 'flow_123',
      deprecated_at: 1704556800,
    };
    
    expect(response.success).toBe(true);
    expect(response.flow_id).toBe('flow_123');
    expect(response.deprecated_at).toBe(1704556800);
  });
});
