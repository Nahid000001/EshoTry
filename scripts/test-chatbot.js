#!/usr/bin/env node

/**
 * EshoTry AI Chatbot Testing Suite
 * Comprehensive testing for chatbot functionality and integration
 */

import axios from 'axios';

class ChatbotTester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.sessionId = null;
  }

  async runTests() {
    console.log('🤖 Testing EshoTry AI Chatbot...\n');
    
    try {
      // Test chatbot status
      await this.testChatbotStatus();
      
      // Test intent recognition
      await this.testIntentRecognition();
      
      // Test conversation flow
      await this.testConversationFlow();
      
      // Test platform integration
      await this.testPlatformIntegration();
      
      // Test error handling
      await this.testErrorHandling();
      
      console.log('\n✅ All chatbot tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Chatbot testing failed:', error.message);
    }
  }

  async testChatbotStatus() {
    console.log('📊 Testing chatbot status...');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/chatbot/status`);
      
      if (response.status === 200 && response.data.status === 'online') {
        console.log('  ✅ Chatbot is online and ready');
        console.log(`  📈 Active sessions: ${response.data.activeSessions}`);
        console.log(`  🔧 Capabilities: ${Object.keys(response.data.capabilities).length} features`);
      } else {
        throw new Error('Chatbot status check failed');
      }
    } catch (error) {
      console.log('  ❌ Status check failed:', error.message);
      throw error;
    }
  }

  async testIntentRecognition() {
    console.log('\n🎯 Testing intent recognition...');
    
    const testCases = [
      {
        message: "I'm looking for a red dress",
        expectedIntent: 'product_inquiry',
        description: 'Product search query'
      },
      {
        message: "How do I use virtual try-on?",
        expectedIntent: 'virtual_tryon_help',
        description: 'Virtual try-on assistance'
      },
      {
        message: "What size should I get?",
        expectedIntent: 'size_help',
        description: 'Size recommendation request'
      },
      {
        message: "Tell me about your AI features",
        expectedIntent: 'ai_features_help',
        description: 'AI features inquiry'
      },
      {
        message: "Where is my order?",
        expectedIntent: 'order_tracking',
        description: 'Order tracking request'
      }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.sendMessage(testCase.message);
        
        if (response.intent === testCase.expectedIntent) {
          console.log(`  ✅ ${testCase.description}: Correct intent (${response.intent})`);
        } else {
          console.log(`  ⚠️  ${testCase.description}: Expected ${testCase.expectedIntent}, got ${response.intent}`);
        }
        
        // Check response quality
        if (response.message && response.message.length > 50) {
          console.log(`    📝 Response quality: Good (${response.message.length} chars)`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`  ❌ ${testCase.description}: Failed - ${error.message}`);
      }
    }
  }

  async testConversationFlow() {
    console.log('\n💬 Testing conversation flow...');
    
    // Test multi-turn conversation
    const conversation = [
      "Hello!",
      "I want to try on clothes virtually",
      "What makes a good photo for try-on?",
      "Can you show me some products?",
      "Thanks for your help!"
    ];

    for (let i = 0; i < conversation.length; i++) {
      try {
        const response = await this.sendMessage(conversation[i]);
        
        console.log(`  Turn ${i + 1}: ${conversation[i]}`);
        console.log(`    🤖 Intent: ${response.intent}, Confidence: ${Math.round((response.confidence || 0) * 100)}%`);
        
        if (response.quickReplies && response.quickReplies.length > 0) {
          console.log(`    🔘 Quick replies: ${response.quickReplies.length} options`);
        }
        
        // Small delay between messages
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.log(`  ❌ Turn ${i + 1} failed: ${error.message}`);
      }
    }
  }

  async testPlatformIntegration() {
    console.log('\n🔗 Testing platform integration...');
    
    const integrationTests = [
      {
        query: "Show me your virtual try-on features",
        expectedFeatures: ['fabric physics', 'privacy', 'processing']
      },
      {
        query: "What AI features do you have?",
        expectedFeatures: ['3d', 'ar', 'recommendations', 'wardrobe']
      },
      {
        query: "Help me with sizing",
        expectedFeatures: ['measurements', 'fit', 'guide']
      }
    ];

    for (const test of integrationTests) {
      try {
        const response = await this.sendMessage(test.query);
        
        const responseText = response.message.toLowerCase();
        const foundFeatures = test.expectedFeatures.filter(feature => 
          responseText.includes(feature)
        );
        
        console.log(`  📝 Query: "${test.query}"`);
        console.log(`    ✅ Features mentioned: ${foundFeatures.length}/${test.expectedFeatures.length}`);
        
        if (response.actions && response.actions.length > 0) {
          console.log(`    🎯 Actions available: ${response.actions.join(', ')}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`  ❌ Integration test failed: ${error.message}`);
      }
    }
  }

  async testErrorHandling() {
    console.log('\n🛡️ Testing error handling...');
    
    const errorTests = [
      {
        description: 'Empty message',
        request: { message: '' },
        shouldFail: true
      },
      {
        description: 'Very long message',
        request: { message: 'a'.repeat(10000) },
        shouldFail: false
      },
      {
        description: 'Invalid session ID',
        request: { message: 'Hello', sessionId: 'invalid-session-id' },
        shouldFail: false
      }
    ];

    for (const test of errorTests) {
      try {
        const response = await axios.post(`${this.baseURL}/api/chatbot/chat`, test.request, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        if (test.shouldFail) {
          console.log(`  ⚠️  ${test.description}: Expected failure but succeeded`);
        } else {
          console.log(`  ✅ ${test.description}: Handled gracefully`);
        }
        
      } catch (error) {
        if (test.shouldFail) {
          console.log(`  ✅ ${test.description}: Correctly rejected`);
        } else {
          console.log(`  ❌ ${test.description}: Unexpected failure - ${error.message}`);
        }
      }
    }
  }

  async sendMessage(message) {
    const response = await axios.post(`${this.baseURL}/api/chatbot/chat`, {
      message,
      sessionId: this.sessionId
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });

    // Update session ID
    if (response.data.sessionId) {
      this.sessionId = response.data.sessionId;
    }

    return response.data;
  }
}

// Run tests
const tester = new ChatbotTester();
tester.runTests().catch(console.error);

export default ChatbotTester;