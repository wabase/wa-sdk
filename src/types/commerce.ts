/**
 * Commerce & Catalog Message Types
 * @module types/commerce
 */

/**
 * Product section for multi-product messages
 */
export interface ProductSection {
  /**
   * Section title (max 24 characters)
   */
  title: string;
  /**
   * List of product retailer IDs in this section
   */
  product_items: Array<{
    /**
     * Product retailer ID from catalog
     */
    product_retailer_id: string;
  }>;
}

/**
 * Parameters for sending single product message
 */
export interface SendSingleProductParams {
  /**
   * Recipient phone number
   */
  to: string;
  /**
   * Catalog ID
   */
  catalog_id: string;
  /**
   * Product retailer ID
   */
  product_retailer_id: string;
  /**
   * Optional body text
   */
  body?: string;
  /**
   * Optional footer text
   */
  footer?: string;
}

/**
 * Parameters for sending multi-product message
 */
export interface SendMultiProductParams {
  /**
   * Recipient phone number
   */
  to: string;
  /**
   * Catalog ID
   */
  catalog_id: string;
  /**
   * Product sections (max 10 sections, max 30 products total)
   */
  sections: ProductSection[];
  /**
   * Optional header text
   */
  header?: string;
  /**
   * Body text (required)
   */
  body: string;
  /**
   * Optional footer text
   */
  footer?: string;
}

/**
 * Parameters for sending catalog message
 */
export interface SendCatalogParams {
  /**
   * Recipient phone number
   */
  to: string;
  /**
   * Body text
   */
  body: string;
  /**
   * Optional footer text
   */
  footer?: string;
}

/**
 * Parameters for sending catalog template message
 */
export interface SendCatalogTemplateParams {
  /**
   * Recipient phone number
   */
  to: string;
  /**
   * Template name
   */
  template_name: string;
  /**
   * Language code (e.g., "en_US")
   */
  language_code: string;
  /**
   * Optional template components
   */
  components?: Array<{
    type: string;
    parameters?: unknown[];
  }>;
}
