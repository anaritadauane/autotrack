import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Create storage bucket on startup
const BUCKET_NAME = 'make-b763bb62-documents';
const initializeStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${BUCKET_NAME}`);
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.error('Failed to create bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    } else {
      console.log('Storage bucket already exists');
    }
  } catch (error) {
    console.error('Storage initialization error:', error);
  }
};

// Initialize storage
initializeStorage();

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-b763bb62/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-b763bb62/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log(`Creating user with email: ${email}, name: ${name}`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${data.user?.id}`);
    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Sign up error: ${error}`);
    return c.json({ error: "Sign up failed" }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-b763bb62/profile", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    console.log(`Profile request: Auth header received: ${authHeader ? 'Bearer [TOKEN]' : 'None'}`);
    
    const accessToken = authHeader?.split(' ')[1];
    if (!accessToken) {
      console.log('Profile request: No access token provided');
      return c.json({ error: "No access token provided" }, 401);
    }

    console.log(`Profile request: Verifying token with Supabase...`);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) {
      console.log(`Profile request: Supabase auth error - ${error.message}`);
      console.log(`Profile request: Error details:`, error);
      return c.json({ error: "Invalid access token" }, 401);
    }
    
    if (!user) {
      console.log('Profile request: No user found for token');
      return c.json({ error: "Invalid access token" }, 401);
    }

    console.log(`Profile request: User verified - ID: ${user.id}, Email: ${user.email}`);

    // Get additional user data from KV store if exists
    const userProfile = await kv.get(`user_profile_${user.id}`);
    
    const result = { 
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'User',
        avatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b11c?w=100&h=100&fit=crop&crop=face',
        ...userProfile
      }
    };
    
    console.log(`Profile request: Returning user data for ${user.email}`);
    return c.json(result);
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    console.log(`Get profile error stack: ${error.stack}`);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// Vehicle Management Endpoints

// Get all vehicles for a user
app.get("/make-server-b763bb62/vehicles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    // Get vehicles for this user
    const vehicles = await kv.getByPrefix(`vehicle_${user.id}_`);
    
    return c.json({ vehicles: vehicles || [] });
  } catch (error) {
    console.log(`Get vehicles error: ${error}`);
    return c.json({ error: "Failed to get vehicles" }, 500);
  }
});

// Add a new vehicle
app.post("/make-server-b763bb62/vehicles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const vehicleData = await c.req.json();
    
    // Generate unique vehicle ID
    const vehicleId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const vehicle = {
      id: vehicleId,
      userId: user.id,
      ...vehicleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store vehicle
    await kv.set(`vehicle_${user.id}_${vehicleId}`, vehicle);
    
    return c.json({ vehicle });
  } catch (error) {
    console.log(`Add vehicle error: ${error}`);
    return c.json({ error: "Failed to add vehicle" }, 500);
  }
});

// Update a vehicle
app.put("/make-server-b763bb62/vehicles/:vehicleId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const vehicleId = c.req.param('vehicleId');
    const vehicleData = await c.req.json();
    
    // Get existing vehicle to verify ownership
    const existingVehicle = await kv.get(`vehicle_${user.id}_${vehicleId}`);
    if (!existingVehicle) {
      return c.json({ error: "Vehicle not found" }, 404);
    }

    const updatedVehicle = {
      ...existingVehicle,
      ...vehicleData,
      updatedAt: new Date().toISOString()
    };

    // Update vehicle
    await kv.set(`vehicle_${user.id}_${vehicleId}`, updatedVehicle);
    
    return c.json({ vehicle: updatedVehicle });
  } catch (error) {
    console.log(`Update vehicle error: ${error}`);
    return c.json({ error: "Failed to update vehicle" }, 500);
  }
});

// Delete a vehicle
app.delete("/make-server-b763bb62/vehicles/:vehicleId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const vehicleId = c.req.param('vehicleId');
    
    // Verify vehicle exists and belongs to user
    const existingVehicle = await kv.get(`vehicle_${user.id}_${vehicleId}`);
    if (!existingVehicle) {
      return c.json({ error: "Vehicle not found" }, 404);
    }

    // Delete vehicle
    await kv.del(`vehicle_${user.id}_${vehicleId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete vehicle error: ${error}`);
    return c.json({ error: "Failed to delete vehicle" }, 500);
  }
});

// Document Management Endpoints

// Get documents for a vehicle
app.get("/make-server-b763bb62/vehicles/:vehicleId/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const vehicleId = c.req.param('vehicleId');
    
    // Get documents for this vehicle
    const documents = await kv.getByPrefix(`document_${user.id}_${vehicleId}_`);
    
    return c.json({ documents: documents || [] });
  } catch (error) {
    console.log(`Get documents error: ${error}`);
    return c.json({ error: "Failed to get documents" }, 500);
  }
});

// Upload document file
app.post("/make-server-b763bb62/vehicles/:vehicleId/documents/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const vehicleId = c.req.param('vehicleId');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const documentData = JSON.parse(formData.get('documentData') as string);
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Generate unique document ID and file path
    const documentId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${vehicleId}/${documentId}.${fileExtension}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return c.json({ error: "Failed to upload file" }, 500);
    }

    // Create signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

    const document = {
      id: documentId,
      userId: user.id,
      vehicleId,
      ...documentData,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      filePath: fileName,
      fileUrl: urlData?.signedUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store document metadata
    await kv.set(`document_${user.id}_${vehicleId}_${documentId}`, document);
    
    return c.json({ document });
  } catch (error) {
    console.log(`Upload document error: ${error}`);
    return c.json({ error: "Failed to upload document" }, 500);
  }
});

// Add a document (without file)
app.post("/make-server-b763bb62/vehicles/:vehicleId/documents", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const vehicleId = c.req.param('vehicleId');
    const documentData = await c.req.json();
    
    // Generate unique document ID
    const documentId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const document = {
      id: documentId,
      userId: user.id,
      vehicleId,
      ...documentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store document
    await kv.set(`document_${user.id}_${vehicleId}_${documentId}`, document);
    
    return c.json({ document });
  } catch (error) {
    console.log(`Add document error: ${error}`);
    return c.json({ error: "Failed to add document" }, 500);
  }
});

// Get signed URL for document
app.get("/make-server-b763bb62/documents/:documentId/url", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const documentId = c.req.param('documentId');
    
    // Find document in KV store
    const documents = await kv.getByPrefix(`document_${user.id}_`);
    const document = documents.find(doc => doc.id === documentId);
    
    if (!document || !document.filePath) {
      return c.json({ error: "Document not found" }, 404);
    }

    // Create new signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(document.filePath, 60 * 60); // 1 hour expiry

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return c.json({ error: "Failed to generate download URL" }, 500);
    }

    return c.json({ url: urlData.signedUrl });
  } catch (error) {
    console.log(`Get document URL error: ${error}`);
    return c.json({ error: "Failed to get document URL" }, 500);
  }
});

// Update user profile
app.put("/make-server-b763bb62/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const profileData = await c.req.json();
    
    // Update user metadata in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        ...profileData
      }
    });

    if (updateError) {
      console.error('Update user metadata error:', updateError);
      return c.json({ error: "Failed to update profile" }, 500);
    }

    // Also store in KV for additional profile data
    await kv.set(`user_profile_${user.id}`, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true, profile: profileData });
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Get activity history for user
app.get("/make-server-b763bb62/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    // Get all vehicles and documents for history
    const vehicles = await kv.getByPrefix(`vehicle_${user.id}_`);
    const allDocuments = await kv.getByPrefix(`document_${user.id}_`);
    
    const historyItems = [];

    // Add vehicle creation events
    vehicles.forEach(vehicle => {
      historyItems.push({
        id: `vehicle_${vehicle.id}`,
        date: vehicle.createdAt,
        type: 'vehicle',
        title: 'Viatura Adicionada',
        description: `${vehicle.name} (${vehicle.plate})`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehiclePlate: vehicle.plate
      });

      // Add insurance, inspection, taxes events based on dates
      if (vehicle.insurance?.date) {
        historyItems.push({
          id: `insurance_${vehicle.id}`,
          date: vehicle.insurance.date,
          type: 'insurance',
          title: 'Seguro',
          description: vehicle.insurance.company || 'Renovação de seguro',
          dateRange: vehicle.insurance.date,
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          vehiclePlate: vehicle.plate,
          status: vehicle.insurance.status
        });
      }

      if (vehicle.inspection?.date) {
        historyItems.push({
          id: `inspection_${vehicle.id}`,
          date: vehicle.inspection.date,
          type: 'inspection',
          title: 'Inspeção',
          description: vehicle.inspection.center || 'Inspeção técnica',
          dateRange: vehicle.inspection.date,
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          vehiclePlate: vehicle.plate,
          status: vehicle.inspection.status
        });
      }

      if (vehicle.taxes?.date) {
        historyItems.push({
          id: `taxes_${vehicle.id}`,
          date: vehicle.taxes.date,
          type: 'taxes',
          title: 'Impostos/Taxas',
          description: 'Pagamento de impostos',
          amount: vehicle.taxes.amount,
          dateRange: vehicle.taxes.date,
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          vehiclePlate: vehicle.plate,
          status: vehicle.taxes.status
        });
      }
    });

    // Add document events
    allDocuments.forEach(document => {
      const vehicle = vehicles.find(v => v.id === document.vehicleId);
      historyItems.push({
        id: `document_${document.id}`,
        date: document.createdAt,
        type: 'document',
        title: 'Documento Adicionado',
        description: document.name,
        vehicleId: document.vehicleId,
        vehicleName: vehicle?.name || 'Viatura',
        vehiclePlate: vehicle?.plate || '',
        documentType: document.type
      });
    });

    // Sort by date (newest first)
    historyItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return c.json({ history: historyItems });
  } catch (error) {
    console.log(`Get history error: ${error}`);
    return c.json({ error: "Failed to get history" }, 500);
  }
});

// Get dashboard stats
app.get("/make-server-b763bb62/stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const vehicles = await kv.getByPrefix(`vehicle_${user.id}_`);
    const documents = await kv.getByPrefix(`document_${user.id}_`);

    const stats = {
      totalVehicles: vehicles.length,
      totalDocuments: documents.length,
      expiredItems: 0,
      expiringItems: 0,
      validItems: 0
    };

    // Count status items
    vehicles.forEach(vehicle => {
      [vehicle.insurance, vehicle.inspection, vehicle.taxes].forEach(item => {
        if (item?.status === 'expired') stats.expiredItems++;
        else if (item?.status === 'warning') stats.expiringItems++;
        else if (item?.status === 'valid') stats.validItems++;
      });
    });

    return c.json({ stats });
  } catch (error) {
    console.log(`Get stats error: ${error}`);
    return c.json({ error: "Failed to get stats" }, 500);
  }
});

// Upload document with file
app.post("/make-server-b763bb62/vehicles/:vehicleId/documents/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const vehicleId = c.req.param('vehicleId');
    
    // Verify vehicle belongs to user
    const vehicle = await kv.get(`vehicle_${user.id}_${vehicleId}`);
    if (!vehicle) {
      return c.json({ error: "Vehicle not found" }, 404);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const documentDataStr = formData.get('documentData') as string;

    if (!file || !documentDataStr) {
      return c.json({ error: "File and document data are required" }, 400);
    }

    const documentData = JSON.parse(documentDataStr);
    
    // Generate unique file path
    const fileExtension = file.name.split('.').pop() || 'bin';
    const fileName = `${user.id}/${vehicleId}/${Date.now()}_${file.name}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return c.json({ error: "Failed to upload file" }, 500);
    }

    // Create document record
    const documentId = crypto.randomUUID();
    const document = {
      id: documentId,
      vehicleId: vehicleId,
      type: documentData.type,
      name: documentData.name,
      description: documentData.description || '',
      expiryDate: documentData.expiryDate || null,
      filePath: uploadData.path,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`document_${user.id}_${documentId}`, document);

    return c.json({ 
      success: true, 
      document,
      message: "Document uploaded successfully" 
    });
  } catch (error) {
    console.log(`Upload document error: ${error}`);
    return c.json({ error: "Failed to upload document" }, 500);
  }
});

// Get signed URL for document download
app.get("/make-server-b763bb62/documents/:documentId/url", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const documentId = c.req.param('documentId');
    const document = await kv.get(`document_${user.id}_${documentId}`);
    
    if (!document || !document.filePath) {
      return c.json({ error: "Document or file not found" }, 404);
    }

    // Generate signed URL for download (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(document.filePath, 3600);

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return c.json({ error: "Failed to generate download URL" }, 500);
    }

    return c.json({ url: urlData.signedUrl });
  } catch (error) {
    console.log(`Get document URL error: ${error}`);
    return c.json({ error: "Failed to get document URL" }, 500);
  }
});

Deno.serve(app.fetch);
