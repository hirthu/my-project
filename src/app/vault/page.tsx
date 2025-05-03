'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, FileText, Video, Mic, UploadCloud, Trash2, Search, ShieldCheck, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns'; // For relative time formatting

// Mock Data Interface
interface VaultItem {
  id: string;
  name: string;
  type: 'note' | 'video' | 'audio' | 'file';
  encryptedContent?: string; // For notes (mock encryption)
  storagePath?: string; // For files/media (mock path)
  createdAt: Date;
  size?: number; // Optional size for files
}

// Mock User ID
const currentUserId = 'user123';

// --- Mock Encryption/Decryption ---
// WARNING: These are **NOT** secure and are for demonstration purposes only.
// Use a proper cryptographic library (Web Crypto API, crypto-js) in production.
const MOCK_ENCRYPTION_PREFIX = 'MOCK_ENC_';
const mockEncrypt = (text: string): string => {
  try {
    // Simple Base64 encoding as a mock
    return MOCK_ENCRYPTION_PREFIX + btoa(unescape(encodeURIComponent(text + Math.random()))); // Add randomness to make output different
  } catch (e) {
    console.error("Mock encryption failed:", e);
    return "ENCRYPTION_ERROR";
  }
};

const mockDecrypt = (encryptedText: string): string => {
  try {
    if (!encryptedText.startsWith(MOCK_ENCRYPTION_PREFIX)) {
      return "Error: Invalid encrypted format (mock)";
    }
    const base64Part = encryptedText.substring(MOCK_ENCRYPTION_PREFIX.length);
    const decodedWithRandom = decodeURIComponent(escape(atob(base64Part)));
    // Extremely crude way to try and extract original - assumes random is float < 1
    const lastDotIndex = decodedWithRandom.lastIndexOf('0.');
    return lastDotIndex > 0 ? decodedWithRandom.substring(0, lastDotIndex) : "Decryption failed (mock)";
  } catch (e) {
    console.error("Mock decryption failed:", e);
    return "DECRYPTION_ERROR";
  }
};

// --- Mock API Functions ---
const fetchVaultItems = async (userId: string): Promise<VaultItem[]> => {
  console.log(`Fetching vault items for user ${userId}...`);
  await new Promise(resolve => setTimeout(resolve, 1000));
   try {
       const storedItems = localStorage.getItem(`tutorverseVault_${userId}`);
       if (storedItems) {
          const parsedItems = JSON.parse(storedItems) as VaultItem[];
           return parsedItems.map(item => ({ ...item, createdAt: new Date(item.createdAt) }));
       }
   } catch (error) { console.error("Error reading vault:", error); }
  // Default mock data if none found
  return [
    { id: 'note1', name: 'Calculus Session Highlights', type: 'note', encryptedContent: mockEncrypt('Remember the limit definition! And practice chain rule.'), createdAt: new Date(Date.now() - 86400000 * 2) },
    { id: 'vid1', name: 'Physics Problem Walkthrough.mp4', type: 'video', storagePath: `/vault/${userId}/vid1.mp4.enc`, createdAt: new Date(Date.now() - 86400000), size: 25 * 1024 * 1024 },
    { id: 'aud1', name: 'Spanish Pronunciation Practice.ogg', type: 'audio', storagePath: `/vault/${userId}/aud1.ogg.enc`, createdAt: new Date(Date.now() - 3600000 * 5), size: 2 * 1024 * 1024 },
  ];
};

const saveVaultItem = async (userId: string, item: Omit<VaultItem, 'id' | 'createdAt'> & { decryptedContent?: string, file?: File }): Promise<VaultItem> => {
  console.log(`Saving vault item for ${userId}:`, item.name, item.type);
  await new Promise(resolve => setTimeout(resolve, 1500));

  let newItem: VaultItem;
  const newId = `item_${Date.now()}`;
  const createdAt = new Date();

  if (item.type === 'note' && item.decryptedContent) {
    const encryptedContent = mockEncrypt(item.decryptedContent);
    newItem = { id: newId, name: item.name, type: 'note', encryptedContent, createdAt };
  } else if (item.file) {
     console.log(`Simulating upload and encryption for ${item.file.name}...`);
     const storagePath = `/vault/${userId}/${newId}.${item.file.name.split('.').pop()}.enc`; // Mock path
     newItem = { id: newId, name: item.name, type: item.type as 'video' | 'audio' | 'file', storagePath, createdAt, size: item.file.size };
     // TODO: In real app, upload item.file to Firebase Storage at storagePath *after* encrypting it client-side or server-side.
  } else {
     throw new Error("Invalid item data for saving.");
  }

   // Save updated list to localStorage (for demo persistence)
   try {
     const currentItems = await fetchVaultItems(userId);
     const updatedItems = [newItem, ...currentItems].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
     localStorage.setItem(`tutorverseVault_${userId}`, JSON.stringify(updatedItems));
   } catch (error) { console.error("Error saving vault:", error); }

  return newItem;
};

const deleteVaultItem = async (userId: string, itemId: string): Promise<boolean> => {
   console.log(`Deleting vault item ${itemId} for user ${userId}...`);
   await new Promise(resolve => setTimeout(resolve, 500));
   try {
      const currentItems = await fetchVaultItems(userId);
      const updatedItems = currentItems.filter(item => item.id !== itemId);
      localStorage.setItem(`tutorverseVault_${userId}`, JSON.stringify(updatedItems));
       // TODO: In real app, also delete the corresponding file from Firebase Storage.
   } catch (error) { console.error("Error deleting vault item:", error); return false; }
   return true;
};

const decryptContent = async (encryptedContent: string | undefined): Promise<string> => {
    console.log("Decrypting content (mock)...");
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!encryptedContent) return "Error: No content to decrypt";
    return mockDecrypt(encryptedContent);
};

// Mock 2FA Check - Replace with Firebase Auth MFA check or custom logic
const check2FAStatus = async (userId: string): Promise<boolean> => {
    console.log(`Checking 2FA status for user ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate 2FA being enabled/verified for demo - toggle this for testing
    const MOCK_2FA_ENABLED = true;
    console.log("Mock 2FA Status:", MOCK_2FA_ENABLED);
    return MOCK_2FA_ENABLED;
}


export default function PrivateVaultPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newItemType, setNewItemType] = useState<'note' | 'file'>('note');
  const [newItemName, setNewItemName] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingItem, setViewingItem] = useState<VaultItem | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState<boolean | null>(null); // null = unchecked, true/false = status
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();


  useEffect(() => {
     // Check 2FA status on load
     const verify2FA = async () => {
        const verified = await check2FAStatus(currentUserId);
        setIs2FAVerified(verified);
        if (verified) {
           loadItems();
        } else {
           setIsLoading(false); // Stop loading if 2FA fails
        }
     };
     verify2FA();
  }, []); // Run only once on mount

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchVaultItems(currentUserId);
      setItems(fetched.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())); // Sort newest first
    } catch (error) {
      toast({ title: 'Error', description: 'Could not load vault items.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
       // Example validation (you might want stricter checks)
       const maxSizeMB = 50;
       if (file.size > maxSizeMB * 1024 * 1024) {
          toast({ title: "File Too Large", description: `File size should not exceed ${maxSizeMB} MB.`, variant: "destructive"});
          resetFileInput();
          return;
       }

      const allowedTypes = ['video/mp4', 'video/webm', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
       if (!allowedTypes.includes(file.type)) {
           toast({ title: "Invalid File Type", description: "Allowed types: Video, Audio, PDF, Image, Text.", variant: "destructive"});
           resetFileInput();
           return;
       }

       let fileVaultType: VaultItem['type'] = 'file';
        if (file.type.startsWith('video/')) fileVaultType = 'video';
        else if (file.type.startsWith('audio/')) fileVaultType = 'audio';

       setNewItemType(fileVaultType); // Auto-set type based on file MIME type
       setSelectedFile(file);
       // Only set name if the user hasn't typed one already
       if (!newItemName.trim()) {
         setNewItemName(file.name);
       }
    }
  };

  const resetFileInput = () => {
     setSelectedFile(null);
     if(fileInputRef.current) fileInputRef.current.value = "";
  }

  const handleAddNewItem = () => {
    // Reset form
    setNewItemType('note');
    setNewItemName('');
    setNewItemContent('');
     resetFileInput();
    setIsAdding(true);
  };

  const handleSaveNewItem = async () => {
     if (!newItemName.trim()) {
         toast({ title: "Missing Name", description: "Please provide a name for your item.", variant: "destructive"});
         return;
     }
     if (newItemType === 'note' && !newItemContent.trim()) {
          toast({ title: "Missing Content", description: "Please enter content for your note.", variant: "destructive"});
         return;
     }
      // Allow saving 'file' type even if not video/audio explicitly
     if (newItemType !== 'note' && !selectedFile) {
           toast({ title: "Missing File", description: "Please select a file to upload.", variant: "destructive"});
         return;
     }

     setIsSaving(true);
     try {
         let itemToSave: any = { name: newItemName.trim(), type: newItemType };
         if (newItemType === 'note') {
             itemToSave.decryptedContent = newItemContent;
         } else if (selectedFile) {
              itemToSave.file = selectedFile;
              // Re-confirm type based on file if needed
               if (selectedFile.type.startsWith('video/')) itemToSave.type = 'video';
               else if (selectedFile.type.startsWith('audio/')) itemToSave.type = 'audio';
               else itemToSave.type = 'file'; // Default to 'file' for others like PDF, images
         }

         const savedItem = await saveVaultItem(currentUserId, itemToSave);
         setItems(prev => [savedItem, ...prev].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
         toast({ title: "Item Saved", description: `"${savedItem.name}" securely added to your vault.` });
         setIsAdding(false);

     } catch (error) {
         toast({ title: "Save Failed", description: "Could not save the item. Please try again.", variant: "destructive" });
     } finally {
         setIsSaving(false);
     }
  };

  const handleDeleteItem = async (itemId: string) => {
     const itemToDelete = items.find(i => i.id === itemId);
     if (!itemToDelete) return;

     const confirmed = confirm(`Are you sure you want to permanently delete "${itemToDelete.name}"? This action cannot be undone.`);
     if (!confirmed) return;

     // Show loading/disabling state during delete
     // For simplicity, we'll just remove it optimistically
     setItems(prev => prev.filter(item => item.id !== itemId));
     if (viewingItem?.id === itemId) {
        setViewingItem(null);
        setDecryptedContent(null);
     }

     try {
         const success = await deleteVaultItem(currentUserId, itemId);
         if (success) {
             toast({ title: "Item Deleted", description: `"${itemToDelete.name}" removed from vault.` });
         } else {
             // If delete failed, add the item back (rollback optimistic update)
             setItems(prev => [itemToDelete, ...prev].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
             toast({ title: "Delete Failed", description: "Could not delete the item. Please try again.", variant: "destructive" });
         }
     } catch (error) {
          setItems(prev => [itemToDelete, ...prev].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
          toast({ title: "Delete Failed", description: "An error occurred while deleting.", variant: "destructive" });
     }
  };

   const handleViewItem = async (item: VaultItem) => {
       // If already viewing this item, close it
       if (viewingItem?.id === item.id) {
           setViewingItem(null);
           setDecryptedContent(null);
           return;
       }

       setViewingItem(item);
       setDecryptedContent(null); // Reset content when viewing new item
       setIsDecrypting(true);
       try {
          if (item.type === 'note') {
             const content = await decryptContent(item.encryptedContent);
             setDecryptedContent(content);
          } else {
             // MOCK: Simulate getting a secure, temporary URL for viewing/downloading
             // In a real app, this might call a Cloud Function to generate a signed URL
             // for the decrypted file in a temporary location or stream it.
             await new Promise(resolve => setTimeout(resolve, 500)); // Simulate URL generation
             setDecryptedContent(`Mock Secure URL: /vault-download/${item.id}?token=...`);
          }
       } catch (error) {
          setDecryptedContent("Error decrypting or getting access URL.");
           toast({ title: "Access Failed", description:"Could not access the item's content.", variant: "destructive"});
       } finally {
           setIsDecrypting(false);
       }
   }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle 2FA Check States
    if (is2FAVerified === null) {
        return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
               <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
               <p className="text-muted-foreground">Verifying vault access...</p>
           </div>
       );
    }

    if (is2FAVerified === false) {
        return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
               <Card className="w-full max-w-md p-6 text-center shadow-lg border-destructive">
                   <CardHeader>
                       <KeyRound className="h-12 w-12 text-destructive mx-auto mb-4"/>
                       <CardTitle>Multi-Factor Authentication Required</CardTitle>
                       <CardDescription>
                           For your security, vault access requires Multi-Factor Authentication (2FA/MFA) to be enabled and verified on your account.
                       </CardDescription>
                   </CardHeader>
                   <CardContent>
                       {/* TODO: Make this a Link to the actual security settings page */}
                       <Button variant="destructive" onClick={() => alert("Navigate to MFA setup (not implemented)")}>
                           Go to Security Settings
                       </Button>
                       <p className="text-xs text-muted-foreground mt-4">You can set up MFA using an authenticator app or SMS.</p>
                   </CardContent>
               </Card>
           </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
         <div className="text-center md:text-left">
             <h1 className="text-3xl font-bold flex items-center">
               <ShieldCheck className="h-8 w-8 mr-2 text-primary" /> Private Tutoring Vault
             </h1>
             <p className="text-muted-foreground">End-to-end encrypted storage for your sensitive notes and files.</p>
          </div>
          <Button onClick={handleAddNewItem} disabled={isAdding || isSaving}>
            <UploadCloud className="mr-2 h-4 w-4" /> Add New Item
          </Button>
      </div>

       {isAdding && (
          <Card className="mb-6 bg-muted/50 animate-in fade-in slide-in-from-top-5 duration-300">
            <CardHeader>
                <CardTitle>Add New Encrypted Item</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <Tabs value={newItemType} onValueChange={(value) => setNewItemType(value as 'note' | 'file')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                       <TabsTrigger value="note" disabled={isSaving}>Secure Note</TabsTrigger>
                       <TabsTrigger value="file" disabled={isSaving}>Secure File/Media</TabsTrigger>
                    </TabsList>
                    <TabsContent value="note" className="pt-4">
                        <div className="space-y-3">
                            <Label htmlFor="noteName">Note Name</Label>
                            <Input id="noteName" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Enter a name for your note" disabled={isSaving}/>
                            <Label htmlFor="noteContent">Content (will be encrypted)</Label>
                            <Textarea id="noteContent" value={newItemContent} onChange={e => setNewItemContent(e.target.value)} placeholder="Type your secure note here..." rows={4} disabled={isSaving}/>
                        </div>
                    </TabsContent>
                     <TabsContent value="file" className="pt-4">
                         <div className="space-y-3">
                            <Label htmlFor="fileName">Display Name</Label>
                            <Input id="fileName" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Enter display name (optional)" disabled={isSaving}/>
                             <Label htmlFor="fileUpload">Select File (Video, Audio, PDF, Image, Text)</Label>
                             <Input id="fileUpload" type="file" ref={fileInputRef} onChange={handleFileChange} disabled={isSaving} accept="video/*,audio/*,.pdf,image/jpeg,image/png,text/plain" />
                              {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name} ({(selectedFile.size / (1024*1024)).toFixed(2)} MB)</p>}
                         </div>
                     </TabsContent>
                </Tabs>
             </CardContent>
             <CardFooter className="flex justify-end gap-2 border-t pt-4">
                 <Button variant="ghost" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
                 <Button onClick={handleSaveNewItem} disabled={isSaving}>
                     {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Encrypting & Saving...</> : <><Lock className="mr-2 h-4 w-4"/> Save to Vault</>}
                 </Button>
             </CardFooter>
          </Card>
       )}

      {/* Vault Items List */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>Your Vault Items ({filteredItems.length})</CardTitle>
           <div className="relative w-full md:max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search by name or type..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="text-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                 <p className="mt-2 text-muted-foreground">Loading encrypted vault...</p>
             </div>
          ) : filteredItems.length > 0 ? (
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {filteredItems.map(item => (
                <li key={item.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 group">
                  <div className="flex items-center space-x-3 overflow-hidden">
                     {item.type === 'note' && <FileText className="h-5 w-5 text-blue-500 shrink-0"/>}
                     {item.type === 'video' && <Video className="h-5 w-5 text-red-500 shrink-0"/>}
                     {item.type === 'audio' && <Mic className="h-5 w-5 text-green-500 shrink-0"/>}
                     {item.type === 'file' && <FileText className="h-5 w-5 text-gray-500 shrink-0"/>}
                     <div className="flex flex-col overflow-hidden">
                       <span className="font-medium truncate" title={item.name}>{item.name}</span>
                       <span className="text-xs text-muted-foreground">
                           Added {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                           {item.size && ` - ${(item.size / (1024*1024)).toFixed(2)} MB`}
                       </span>
                     </div>
                  </div>
                  <div className="flex space-x-1 shrink-0">
                     <Button variant="ghost" size="icon" onClick={() => handleViewItem(item)} title={viewingItem?.id === item.id ? "Hide Content" : "View/Decrypt"} className="h-8 w-8">
                       {viewingItem?.id === item.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-destructive hover:text-destructive h-8 w-8" title="Delete">
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-10 border border-dashed rounded-md">
               <Lock className="h-10 w-10 mx-auto mb-3"/>
                <p>Your vault is currently empty.</p>
                <p className="text-sm">Click "Add New Item" to securely store your first note or file.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viewing Pane (Modal-like, fixed at bottom right) */}
       {viewingItem && (
           <Card className="mt-6 fixed bottom-4 right-4 w-[95vw] max-w-lg z-50 shadow-xl border-primary animate-in slide-in-from-bottom-5 duration-300 bg-background">
             <CardHeader className="flex flex-row items-start justify-between pb-3">
                 <div className="flex items-center space-x-2 overflow-hidden mr-2">
                      {viewingItem.type === 'note' && <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-1"/>}
                      {viewingItem.type === 'video' && <Video className="h-5 w-5 text-red-500 shrink-0 mt-1"/>}
                      {viewingItem.type === 'audio' && <Mic className="h-5 w-5 text-green-500 shrink-0 mt-1"/>}
                       {viewingItem.type === 'file' && <FileText className="h-5 w-5 text-gray-500 shrink-0 mt-1"/>}
                     <CardTitle className="text-lg leading-tight break-words">{viewingItem.name}</CardTitle>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => { setViewingItem(null); setDecryptedContent(null); }} className="h-7 w-7 shrink-0">
                    <EyeOff className="h-5 w-5" />
                     <span className="sr-only">Close Viewer</span>
                 </Button>
             </CardHeader>
             <CardContent className="max-h-60 overflow-y-auto py-2">
                 {isDecrypting ? (
                    <div className="flex items-center justify-center p-4">
                       <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2"/> Decrypting & Accessing...
                    </div>
                 ) : decryptedContent ? (
                     viewingItem.type === 'note' ? (
                         <pre className="text-sm whitespace-pre-wrap font-sans p-2 bg-muted rounded">{decryptedContent}</pre>
                     ) : (
                         // Mock access for files/media
                         <div className="space-y-2 p-2 bg-muted rounded">
                           <p className="text-sm text-muted-foreground">Secure access requested:</p>
                           {/* In real app, clicking this might open the file in a new tab via the secure URL, or initiate download */}
                           <Button size="sm" variant="secondary" onClick={() => alert(`Accessing: ${decryptedContent}`)}>
                               {viewingItem.type === 'video' && 'Watch Secure Video'}
                               {viewingItem.type === 'audio' && 'Listen to Secure Audio'}
                               {viewingItem.type === 'file' && 'Download Secure File'}
                           </Button>
                           <p className="text-xs text-muted-foreground">(Mock URL: {decryptedContent})</p>
                         </div>
                     )
                 ) : (
                     <p className="text-destructive text-center p-4">Could not load content.</p>
                 )}
             </CardContent>
               <CardFooter className="text-xs text-muted-foreground pt-2 pb-3 border-t">
                  Added {formatDistanceToNow(viewingItem.createdAt, { addSuffix: true })}
               </CardFooter>
           </Card>
       )}

    </div>
  );
}
