/**
 * eco-core.js
 * Lightweight core library for sustainable web development
 * Version: 1.0.0
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.EcoCore = factory());
}(this, (function () {
  'use strict';

  /**
   * Main EcoCore object
   */
  const EcoCore = {
    version: '1.0.0',

    /**
     * Initialize the EcoCore library
     * @param {Object} options - Configuration options
     */
    init: function(options = {}) {
      this.options = {
        lazyLoad: options.lazyLoad !== undefined ? options.lazyLoad : true,
        minimalAnimation: options.minimalAnimation !== undefined ? options.minimalAnimation : true,
        optimizeImages: options.optimizeImages !== undefined ? options.optimizeImages : true,
        darkMode: options.darkMode !== undefined ? options.darkMode : false,
        ...options
      };

      this._setupListeners();

      if (this.options.lazyLoad) {
        this.lazyLoad.init();
      }

      if (this.options.optimizeImages) {
        this.imageOptimizer.init();
      }

      if (this.options.darkMode) {
        this.darkMode.init();
      }

      return this;
    },

    /**
     * Setup event listeners
     * @private
     */
    _setupListeners: function() {
      // Use passive listeners where possible to improve performance
      document.addEventListener('DOMContentLoaded', this._onDocumentReady.bind(this), { passive: true });
    },

    /**
     * Handler for DOMContentLoaded event
     * @private
     */
    _onDocumentReady: function() {
      if (this.options.minimalAnimation) {
        this.animationOptimizer.init();
      }
      
      // Report initial metrics
      this.metrics.measure();
    },

    /**
     * Calculate the carbon footprint of the current page
     * @return {Object} - Carbon metrics object
     */
    calculateFootprint: function() {
      return this.metrics.calculateFootprint();
    },

    /**
     * Lazy Loading Module
     */
    lazyLoad: {
      /**
       * Initialize lazy loading functionality
       */
      init: function() {
        // Check for native lazy loading support
        if ('loading' in HTMLImageElement.prototype) {
          this._useNativeLazyLoading();
        } else {
          this._useCustomLazyLoading();
        }
      },

      /**
       * Use native browser lazy loading
       * @private
       */
      _useNativeLazyLoading: function() {
        // Find images without loading attribute
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
          img.setAttribute('loading', 'lazy');
        });

        // Find iframes without loading attribute
        const iframes = document.querySelectorAll('iframe:not([loading])');
        iframes.forEach(iframe => {
          iframe.setAttribute('loading', 'lazy');
        });
      },

      /**
       * Use custom lazy loading for browsers without native support
       * @private
       */
      _useCustomLazyLoading: function() {
        const lazyElements = document.querySelectorAll('[data-src]');
        
        // Use Intersection Observer if available
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const element = entry.target;
                element.src = element.dataset.src;
                element.removeAttribute('data-src');
                observer.unobserve(element);
              }
            });
          }, { rootMargin: '200px' });
          
          lazyElements.forEach(element => observer.observe(element));
        } else {
          // Fallback for browsers without Intersection Observer
          this._legacyLazyLoad();
        }
      },

      /**
       * Legacy lazy loading for older browsers
       * @private
       */
      _legacyLazyLoad: function() {
        let active = false;

        const lazyLoad = () => {
          if (active === false) {
            active = true;
            
            setTimeout(() => {
              const lazyElements = document.querySelectorAll('[data-src]');
              
              lazyElements.forEach(element => {
                if ((element.getBoundingClientRect().top <= window.innerHeight 
                     && element.getBoundingClientRect().bottom >= 0) 
                     && getComputedStyle(element).display !== "none") {
                  
                  element.src = element.dataset.src;
                  element.removeAttribute('data-src');
                }
              });
              
              if (document.querySelectorAll('[data-src]').length === 0) {
                document.removeEventListener('scroll', lazyLoad);
                window.removeEventListener('resize', lazyLoad);
                window.removeEventListener('orientationChange', lazyLoad);
              }
              
              active = false;
            }, 200);
          }
        };
        
        // Add event listeners with passive option for better performance
        document.addEventListener('scroll', lazyLoad, { passive: true });
        window.addEventListener('resize', lazyLoad, { passive: true });
        window.addEventListener('orientationChange', lazyLoad, { passive: true });
        
        // Initial load
        lazyLoad();
      }
    },

    /**
     * Image Optimization Module
     */
    imageOptimizer: {
      /**
       * Initialize image optimization functionality
       */
      init: function() {
        this._optimizeResponsiveImages();
        this._convertImagesToWebP();
      },

      /**
       * Add responsive sizing to images
       * @private
       */
      _optimizeResponsiveImages: function() {
        const images = document.querySelectorAll('img:not([srcset])');
        
        images.forEach(img => {
          // Skip if already handled
          if (img.hasAttribute('data-eco-optimized')) return;
          
          // Get current image dimensions
          const width = img.clientWidth || img.width || 300;
          
          // Only proceed if we can determine width
          if (width > 0) {
            // Create a srcset if dimensions available
            const src = img.src;
            if (src && !img.hasAttribute('srcset') && !src.startsWith('data:')) {
              // Mark as optimized
              img.setAttribute('data-eco-optimized', 'true');
              
              // Add sizes attribute if missing
              if (!img.hasAttribute('sizes')) {
                img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
              }
            }
          }
        });
      },

      /**
       * Check for WebP support and convert images if possible
       * @private
       */
      _convertImagesToWebP: function() {
        // Feature detection for WebP
        const testWebP = (callback) => {
          const webP = new Image();
          webP.onload = webP.onerror = () => {
            callback(webP.height === 2);
          };
          webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        };

        testWebP((support) => {
          if (support) {
            // Browser supports WebP, we could auto-convert or suggest WebP versions
            // This is a placeholder for actual conversion logic
            console.log('WebP supported - optimize by converting images to WebP format');
          }
        });
      }
    },

    /**
     * Animation Optimization Module
     */
    animationOptimizer: {
      /**
       * Initialize animation optimization
       */
      init: function() {
        this._detectReducedMotion();
        this._limitAnimations();
      },

      /**
       * Detect if user has requested reduced motion
       * @private
       */
      _detectReducedMotion: function() {
        // Check for prefers-reduced-motion media query
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.documentElement.classList.add('eco-reduced-motion');
        }
      },

      /**
       * Limit animations to be more energy-efficient
       * @private
       */
      _limitAnimations: function() {
        // Add a class to the document element to enable CSS optimizations
        document.documentElement.classList.add('eco-optimize-animations');

        // Find elements with heavy animations and add them to the IntersectionObserver
        const animatedElements = document.querySelectorAll('.animate, [data-animate], [data-animation]');
        
        if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
          const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              // Only play animations when element is visible
              if (entry.isIntersecting) {
                entry.target.classList.add('animate-active');
              } else {
                entry.target.classList.remove('animate-active');
              }
            });
          }, { threshold: 0.1 });
          
          animatedElements.forEach(element => observer.observe(element));
        }
      }
    },

    /**
     * Dark Mode Module (reduces energy consumption on OLED screens)
     */
    darkMode: {
      /**
       * Initialize dark mode functionality
       */
      init: function() {
        this._setupDarkMode();
      },

      /**
       * Setup dark mode based on user preference
       * @private
       */
      _setupDarkMode: function() {
        // Check for user preference
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Set initial mode based on preference
        if (prefersDarkScheme.matches) {
          document.documentElement.classList.add('eco-dark-mode');
        }
        
        // Listen for changes
        prefersDarkScheme.addEventListener('change', e => {
          if (e.matches) {
            document.documentElement.classList.add('eco-dark-mode');
          } else {
            document.documentElement.classList.remove('eco-dark-mode');
          }
        });
      },

      /**
       * Toggle dark mode manually
       */
      toggle: function() {
        document.documentElement.classList.toggle('eco-dark-mode');
        return document.documentElement.classList.contains('eco-dark-mode');
      }
    },

    /**
     * Metrics Module
     */
    metrics: {
      /**
       * Current page metrics
       */
      data: {
        pageWeight: 0,
        requests: 0,
        domNodes: 0,
        estimatedCO2: 0
      },

      /**
       * Measure current page metrics
       */
      measure: function() {
        this._measurePageWeight();
        this._countRequests();
        this._measureDOMSize();
        
        return this.data;
      },

      /**
       * Estimate page weight
       * @private
       */
      _measurePageWeight: function() {
        // Basic page weight calculation
        let totalBytes = 0;
        
        // Use Performance API if available
        if (window.performance && performance.getEntriesByType) {
          const resources = performance.getEntriesByType('resource');
          resources.forEach(resource => {
            // encodedBodySize represents the compressed size
            if (resource.encodedBodySize) {
              totalBytes += resource.encodedBodySize;
            }
          });
        }

        // Add the HTML document size (approximate)
        totalBytes += new Blob([document.documentElement.outerHTML]).size;
        
        this.data.pageWeight = Math.round(totalBytes / 1024); // KB
      },

      /**
       * Count HTTP requests
       * @private
       */
      _countRequests: function() {
        if (window.performance && performance.getEntriesByType) {
          this.data.requests = performance.getEntriesByType('resource').length;
        }
      },

      /**
       * Measure DOM complexity
       * @private
       */
      _measureDOMSize: function() {
        this.data.domNodes = document.getElementsByTagName('*').length;
      },

      /**
       * Calculate carbon footprint of the page
       */
      calculateFootprint: function() {
        // A simplified model for carbon calculation
        // Based on research data from "The carbon footprint of the internet" studies
        const pageWeightInMB = this.data.pageWeight / 1024;
        
        // Average carbon per MB transfer (very approximate)
        // Based on average energy mix and transfer costs
        const gramsPerMB = 0.2; 
        
        this.data.estimatedCO2 = (pageWeightInMB * gramsPerMB).toFixed(2);
        
        return {
          pageWeight: this.data.pageWeight + ' KB',
          requests: this.data.requests,
          domNodes: this.data.domNodes,
          estimatedCO2: this.data.estimatedCO2 + ' g CO2e'
        };
      },

      /**
       * Get performance tips based on current metrics
       */
      getPerformanceTips: function() {
        const tips = [];
        
        // Page weight recommendations
        if (this.data.pageWeight > 1500) {
          tips.push('Reduce page weight by optimizing images and minifying assets.');
        }
        
        // Request count recommendations
        if (this.data.requests > 50) {
          tips.push('Reduce the number of HTTP requests by bundling resources.');
        }
        
        // DOM size recommendations
        if (this.data.domNodes > 1000) {
          tips.push('Simplify DOM structure by removing unnecessary elements.');
        }
        
        return tips.length ? tips : ['Your page is already well optimized!'];
      }
    },

    /**
     * Get a sustainability score for the current page (0-100)
     * @return {Number} - Sustainability score
     */
    getSustainabilityScore: function() {
      const metrics = this.metrics.data;
      let score = 100;
      
      // Weight penalties
      if (metrics.pageWeight > 5000) {
        score -= 30;
      } else if (metrics.pageWeight > 2000) {
        score -= 20;
      } else if (metrics.pageWeight > 1000) {
        score -= 10;
      }
      
      // Request penalties
      if (metrics.requests > 100) {
        score -= 30;
      } else if (metrics.requests > 50) {
        score -= 20;
      } else if (metrics.requests > 25) {
        score -= 10;
      }
      
      // DOM complexity penalties
      if (metrics.domNodes > 2000) {
        score -= 30;
      } else if (metrics.domNodes > 1000) {
        score -= 20;
      } else if (metrics.domNodes > 500) {
        score -= 10;
      }
      
      return Math.max(0, Math.min(100, score));
    }
  };
  
  return EcoCore;
})));
