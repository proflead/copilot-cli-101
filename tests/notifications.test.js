import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import notifications, { NotificationManager } from '../js/notifications.js';

describe('NotificationManager', () => {
  let container;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '';
    
    // Create container
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
  });

  describe('initialization', () => {
    it('should have default configuration', () => {
      const manager = new NotificationManager();
      expect(manager.defaultDuration).toBe(3000);
      expect(manager.notifications).toEqual([]);
    });

    it('should create container if it does not exist', () => {
      document.body.innerHTML = '';
      const manager = new NotificationManager();
      
      // Wait for DOM to be ready
      manager.createContainer();
      
      const container = document.getElementById('toast-container');
      expect(container).toBeDefined();
      expect(container.className).toBe('toast-container');
    });

    it('should use existing container if present', () => {
      const existingContainer = document.createElement('div');
      existingContainer.id = 'toast-container';
      existingContainer.className = 'custom-class';
      document.body.appendChild(existingContainer);

      const manager = new NotificationManager();
      manager.createContainer();

      expect(manager.container.className).toContain('custom-class');
    });
  });

  describe('show', () => {
    it('should create and display a toast notification', () => {
      const toast = notifications.show('Test message', 'info');

      expect(toast).toBeDefined();
      expect(toast.className).toContain('toast');
      expect(toast.className).toContain('toast-info');
      expect(toast.textContent).toContain('Test message');
    });

    it('should add toast to notifications array', () => {
      const initialCount = notifications.notifications.length;
      notifications.show('Test message', 'info');

      expect(notifications.notifications.length).toBe(initialCount + 1);
    });

    it('should include icon in toast', () => {
      const toast = notifications.show('Test message', 'success');
      const icon = toast.querySelector('.toast-icon');

      expect(icon).toBeDefined();
      expect(icon.textContent).toBe('✓');
    });

    it('should include message in toast', () => {
      const toast = notifications.show('Test message', 'info');
      const message = toast.querySelector('.toast-message');

      expect(message).toBeDefined();
      expect(message.textContent).toBe('Test message');
    });

    it('should include close button', () => {
      const toast = notifications.show('Test message', 'info');
      const closeBtn = toast.querySelector('.toast-close');

      expect(closeBtn).toBeDefined();
      expect(closeBtn.getAttribute('aria-label')).toBe('Close');
    });

    it('should apply correct type class', () => {
      const types = ['success', 'error', 'warning', 'info'];

      types.forEach(type => {
        const toast = notifications.show('Test', type);
        expect(toast.className).toContain(`toast-${type}`);
      });
    });

    it('should auto dismiss after duration', async () => {
      const toast = notifications.show('Test message', 'info', 100);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(toast.className).toContain('hide');
    });

    it('should not auto dismiss when duration is 0', async () => {
      const toast = notifications.show('Test message', 'info', 0);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(toast.className).not.toContain('hide');
    });

    it('should prevent XSS in message', () => {
      const maliciousMessage = '<script>alert("XSS")</script>';
      const toast = notifications.show(maliciousMessage, 'info');
      const messageSpan = toast.querySelector('.toast-message');

      expect(messageSpan.innerHTML).not.toContain('<script>');
      expect(messageSpan.textContent).toBe(maliciousMessage);
    });
  });

  describe('dismiss', () => {
    it('should dismiss a toast notification', () => {
      const toast = notifications.show('Test message', 'info', 0);
      
      notifications.dismiss(toast);

      expect(toast.className).toContain('hide');
    });

    it('should remove toast from DOM after animation', async () => {
      const toast = notifications.show('Test message', 'info', 0);
      const parent = toast.parentElement;
      
      notifications.dismiss(toast);

      await new Promise(resolve => setTimeout(resolve, 350));

      expect(parent.contains(toast)).toBe(false);
    });

    it('should remove toast from notifications array', async () => {
      const toast = notifications.show('Test message', 'info', 0);
      const initialCount = notifications.notifications.length;
      
      notifications.dismiss(toast);

      await new Promise(resolve => setTimeout(resolve, 350));

      expect(notifications.notifications.length).toBe(initialCount - 1);
    });

    it('should handle dismissing non-existent toast', () => {
      const fakeToast = document.createElement('div');
      
      expect(() => notifications.dismiss(fakeToast)).not.toThrow();
    });

    it('should handle close button click', () => {
      const toast = notifications.show('Test message', 'info', 0);
      const closeBtn = toast.querySelector('.toast-close');

      closeBtn.click();

      expect(toast.className).toContain('hide');
    });
  });

  describe('dismissAll', () => {
    it('should dismiss all notifications', async () => {
      notifications.show('Message 1', 'info', 0);
      notifications.show('Message 2', 'success', 0);
      notifications.show('Message 3', 'warning', 0);

      const count = notifications.notifications.length;
      expect(count).toBeGreaterThanOrEqual(3);

      notifications.dismissAll();

      await new Promise(resolve => setTimeout(resolve, 350));

      const remaining = container.querySelectorAll('.toast:not(.hide)');
      expect(remaining.length).toBe(0);
    });
  });

  describe('getIcon', () => {
    it('should return correct icon for each type', () => {
      expect(notifications.getIcon('success')).toBe('✓');
      expect(notifications.getIcon('error')).toBe('✕');
      expect(notifications.getIcon('warning')).toBe('⚠');
      expect(notifications.getIcon('info')).toBe('ℹ');
    });

    it('should return info icon for unknown type', () => {
      expect(notifications.getIcon('unknown')).toBe('ℹ');
    });
  });

  describe('convenience methods', () => {
    it('should create success notification', () => {
      const toast = notifications.success('Success!');

      expect(toast.className).toContain('toast-success');
      expect(toast.textContent).toContain('Success!');
    });

    it('should create error notification', () => {
      const toast = notifications.error('Error!');

      expect(toast.className).toContain('toast-error');
      expect(toast.textContent).toContain('Error!');
    });

    it('should create warning notification', () => {
      const toast = notifications.warning('Warning!');

      expect(toast.className).toContain('toast-warning');
      expect(toast.textContent).toContain('Warning!');
    });

    it('should create info notification', () => {
      const toast = notifications.info('Info!');

      expect(toast.className).toContain('toast-info');
      expect(toast.textContent).toContain('Info!');
    });

    it('should accept custom duration', () => {
      const toast = notifications.success('Success!', 5000);
      expect(toast).toBeDefined();
    });
  });

  describe('multiple notifications', () => {
    it('should stack multiple notifications', () => {
      notifications.success('First');
      notifications.error('Second');
      notifications.warning('Third');

      const toasts = container.querySelectorAll('.toast');
      expect(toasts.length).toBeGreaterThanOrEqual(3);
    });

    it('should maintain order of notifications', () => {
      notifications.success('First');
      notifications.error('Second');
      notifications.warning('Third');

      const toasts = container.querySelectorAll('.toast');
      expect(toasts[toasts.length - 3].textContent).toContain('First');
      expect(toasts[toasts.length - 2].textContent).toContain('Second');
      expect(toasts[toasts.length - 1].textContent).toContain('Third');
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      const toast = notifications.show('', 'info');
      expect(toast).toBeDefined();
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(500);
      const toast = notifications.show(longMessage, 'info');
      
      expect(toast.textContent).toContain(longMessage);
    });

    it('should handle special characters in message', () => {
      const specialMessage = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
      const toast = notifications.show(specialMessage, 'info');
      
      expect(toast.textContent).toContain(specialMessage);
    });

    it('should handle unicode characters', () => {
      const unicodeMessage = '你好世界 🌍 مرحبا';
      const toast = notifications.show(unicodeMessage, 'info');
      
      expect(toast.textContent).toContain(unicodeMessage);
    });
  });
});
