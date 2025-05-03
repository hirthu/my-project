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

// Mock functions - replace with actual Firebase + Encryption logic
const fetchVaultItems = async (): Promise<VaultItem[]> => {
  console.log('Fetching vault items...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Load mock data from localStorage or return defaults
   try {
       const storedItems = localStorage.getItem('tutorverseVault');
       if (storedItems) {
          const parsedItems = JSON.parse(storedItems) as VaultItem[];
           // Ensure createdAt is a Date object
           return parsedItems.map(item => ({ ...item, createdAt: new Date(item.createdAt) }));
       }
   } catch (error) {
       console.error("Error reading vault from localStorage:", error);
   }
  return [
    { id: 'note1', name: 'Calculus Session Highlights', type: 'note', encryptedContent: 'U2FsdGVkX1...mock_encrypted_data.../L8=', createdAt: new Date(Date.now() - 86400000 * 2) },
    { id: 'vid1', name: 'Physics Problem Walkthrough.mp4', type: 'video', storagePath: '/vault/user123/vid1.mp4.enc', createdAt: new Date(Date.now() - 86400000), size: 25 * 1024 * 1024 },
  ];
};

const saveVaultItem = async (item: Omit<VaultItem, 'id' | 'createdAt'> & { decryptedContent?: string, file?: File }): Promise<VaultItem> => {
  console.log('Saving vault item:', item.name, item.type);
  await new Promise(resolve => setTimeout(resolve, 1500));

  let newItem: VaultItem;
  const newId = `item_${Date.now()}`;
  const createdAt = new Date();

  if (item.type === 'note' && item.decryptedContent) {
    // MOCK ENCRYPTION: In reality, use crypto library (e.g., crypto-js or Web Crypto API)
    const encryptedContent = `U2FsdGVkX1${btoa(item.decryptedContent + Math.random())}`;
    newItem = { id: newId, name: item.name, type: 'note', encryptedContent, createdAt };
  } else if (item.file) {
     // MOCK UPLOAD & ENCRYPTION: Upload file, get storagePath, store metadata
     console.log(`Simulating upload and encryption for ${item.file.name}...`);
     const storagePath = `/vault/user123/${newId}.${item.file.name.split('.').pop()}.enc`;
     newItem = { id: newId, name: item.name, type: item.type as 'video' | 'audio' | 'file', storagePath, createdAt, size: item.file.size };
  } else {
     throw new Error("Invalid item data for saving.");
  }

   // Save updated list to localStorage (for demo persistence)
   try {
     const currentItems = await fetchVaultItems(); // Fetch existing
     const updatedItems = [...currentItems, newItem];
     localStorage.setItem('tutorverseVault', JSON.stringify(updatedItems));
   } catch (error) {
     console.error("Error saving vault to localStorage:", error);
   }

  return newItem;
};

const deleteVaultItem = async (itemId: string): Promise<boolean> => {
   console.log('Deleting vault item:', itemId);
   await new Promise(resolve => setTimeout(resolve, 500));
    // Remove from localStorage
   try {
      const currentItems = await fetchVaultItems();
      const updatedItems = currentItems.filter(item => item.id !== itemId);
      localStorage.setItem('tutorverseVault', JSON.stringify(updatedItems));
   } catch (error) {
      console.error("Error deleting vault item from localStorage:", error);
      return false;
   }
   return true; // Simulate success
};

// Mock Decryption - Replace with real crypto logic
const decryptContent = async (encryptedContent: string | undefined): Promise<string> => {
    console.log("Decrypting content...");
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!encryptedContent) return "Error: No content to decrypt";
     try {
       // Basic mock: Try to decode base64 and remove random part
       const base64Part = encryptedContent.replace('U2FsdGVkX1', '');
       const decoded = atob(base64Part);
       // Very crude way to find original content - DO NOT USE IN PRODUCTION
       const originalContent = decoded.substring(0, decoded.lastIndexOf('0.'));
       return originalContent.length > 0 ? originalContent : "Decryption failed (mock)";
     } catch (e) {
        return "Decryption failed (mock error)";
     }
};

// Mock 2FA Check - Replace with Firebase Auth MFA check
const check2FAStatus = async (): Promise<boolean> => {
    console.log("Checking 2FA status...");
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate 2FA being enabled/verified for demo
    return true;
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
        const verified = await check2FAStatus();
        setIs2FAVerified(verified);
        if (verified) {
           loadItems();
        } else {
           setIsLoading(false); // Stop loading if 2FA fails
        }
     };
     verify2FA();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchVaultItems();
      setItems(fetched);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not load vault items.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
       // Basic type check example
      const allowedTypes = ['video/mp4', 'video/webm', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'application/pdf', 'image/jpeg', 'image/png'];
       if (!allowedTypes.includes(file.type)) {
           toast({ title: "Invalid File Type", description: "Please upload video, audio, PDF, or image files.", variant: "destructive"});
           setSelectedFile(null);
           if(fileInputRef.current) fileInputRef.current.value = ""; // Reset input
           return;
       }
       let fileVaultType: VaultItem['type'] = 'file';
        if (file.type.startsWith('video/')) fileVaultType = 'video';
        else if (file.type.startsWith('audio/')) fileVaultType = 'audio';

       setNewItemType(fileVaultType); // Set type based on file
       setSelectedFile(file);
       setNewItemName(file.name); // Auto-fill name
    }
  };

  const handleAddNewItem = () => {
    // Reset form
    setNewItemType('note');
    setNewItemName('');
    setNewItemContent('');
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
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
              // Determine type if it wasn't set by file change
               if (!['video', 'audio', 'file'].includes(itemToSave.type)) {
                   if (selectedFile.type.startsWith('video/')) itemToSave.type = 'video';
                   else if (selectedFile.type.startsWith('audio/')) itemToSave.type = 'audio';
                   else itemToSave.type = 'file';
               }
         }

         const savedItem = await saveVaultItem(itemToSave);
         setItems(prev => [savedItem, ...prev].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())); // Add and re-sort
         toast({ title: "Item Saved", description: `"${savedItem.name}" added to your vault.` });
         setIsAdding(false); // Close add form

     } catch (error) {
         toast({ title: "Save Failed", description: "Could not save the item.", variant: "destructive" });
     } finally {
         setIsSaving(false);
     }
  };

  const handleDeleteItem = async (itemId: string) => {
     // Add confirmation dialog here in a real app
     const itemToDelete = items.find(i => i.id === itemId);
     if (!itemToDelete) return;

     const confirmed = confirm(`Are you sure you want to delete "${itemToDelete.name}"? This cannot be undone.`);
     if (!confirmed) return;

     try {
         const success = await deleteVaultItem(itemId);
         if (success) {
             setItems(prev => prev.filter(item => item.id !== itemId));
              if (viewingItem?.id === itemId) {
                 setViewingItem(null); // Close view if deleting viewed item
                 setDecryptedContent(null);
              }
             toast({ title: "Item Deleted", description: `"${itemToDelete.name}" removed from vault.` });
         } else {
              toast({ title: "Delete Failed", variant: "destructive" });
         }
     } catch (error) {
         toast({ title: "Delete Failed", variant: "destructive" });
     }
  };

   const handleViewItem = async (item: VaultItem) => {
       setViewingItem(item);
       setDecryptedContent(null); // Reset content when viewing new item
       setIsDecrypting(true);
       try {
          if (item.type === 'note') {
             const content = await decryptContent(item.encryptedContent);
             setDecryptedContent(content);
          } else {
             // For files/media, you'd typically generate a temporary signed URL
             // to securely stream/download the decrypted content.
             // For this mock, we just show the path.
             setDecryptedContent(`Mock: Access secure content at path: ${item.storagePath}`);
          }
       } catch (error) {
          setDecryptedContent("Error decrypting content.");
           toast({ title: "Decryption Failed", variant: "destructive"});
       } finally {
           setIsDecrypting(false);
       }
   }

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle 2FA Check States
    if (is2FAVerified === null) {
        return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
               <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
               <p className="text-muted-foreground">Verifying security access...</p>
           </div>
       );
    }

    if (is2FAVerified === false) {
        return (
           <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
               <Card className="w-full max-w-md p-6 text-center shadow-lg">
                   <CardHeader>
                       <KeyRound className="h-12 w-12 text-destructive mx-auto mb-4"/>
                       <CardTitle>Multi-Factor Authentication Required</CardTitle>
                       <CardDescription>
                           Your private vault is protected. Please complete 2FA setup or verification in your account settings to access it.
                       </CardDescription>
                   </CardHeader>
                   <CardContent>
                       {/* TODO: Add link to MFA setup page */}
                       <Button variant="outline" onClick={() => alert("Navigate to MFA setup (not implemented)")}>
                           Go to Security Settings
                       </Button>
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
             <p className="text-muted-foreground">Securely store personal notes, recordings, and files.</p>
          </div>
          <Button onClick={handleAddNewItem} disabled={isAdding}>
            <UploadCloud className="mr-2 h-4 w-4" /> Add New Item
          </Button>
      </div>

       {isAdding && (
          <Card className="mb-6 bg-muted/50">
            <CardHeader>
                <CardTitle>Add New Vault Item</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <Tabs value={newItemType} onValueChange={(value) => setNewItemType(value as 'note' | 'file')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                       <TabsTrigger value="note" disabled={isSaving}>Note</TabsTrigger>
                       <TabsTrigger value="file" disabled={isSaving}>File/Media</TabsTrigger>
                    </TabsList>
                    <TabsContent value="note">
                        <div className="space-y-3 mt-4">
                            <Label htmlFor="noteName">Note Name</Label>
                            <Input id="noteName" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Enter a name for your note" disabled={isSaving}/>
                            <Label htmlFor="noteContent">Content (will be encrypted)</Label>
                            <Textarea id="noteContent" value={newItemContent} onChange={e => setNewItemContent(e.target.value)} placeholder="Type your secure note here..." rows={4} disabled={isSaving}/>
                        </div>
                    </TabsContent>
                     <TabsContent value="file">
                         <div className="space-y-3 mt-4">
                            <Label htmlFor="fileName">File Name (optional, defaults to filename)</Label>
                            <Input id="fileName" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Enter a name or leave blank" disabled={isSaving}/>
                             <Label htmlFor="fileUpload">Select File (Video, Audio, PDF, Image)</Label>
                             <Input id="fileUpload" type="file" ref={fileInputRef} onChange={handleFileChange} disabled={isSaving} accept="video/*,audio/*,.pdf,image/jpeg,image/png" />
                              {selectedFile && <p className="text-sm text-muted-foreground">Selected: {selectedFile.name} ({(selectedFile.size / (1024*1024)).toFixed(2)} MB)</p>}
                         </div>
                     </TabsContent>
                </Tabs>
             </CardContent>
             <CardFooter className="flex justify-end gap-2">
                 <Button variant="outline" onClick={() => setIsAdding(false)} disabled={isSaving}>Cancel</Button>
                 <Button onClick={handleSaveNewItem} disabled={isSaving}>
                     {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save to Vault'}
                 </Button>
             </CardFooter>
          </Card>
       )}

      {/* Vault Items List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Vault Items</CardTitle>
           <div className="relative w-full max-w-xs">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search vault..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="text-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                 <p className="mt-2 text-muted-foreground">Loading vault...</p>
             </div>
          ) : filteredItems.length > 0 ? (
            <ul className="space-y-3">
              {filteredItems.map(item => (
                <li key={item.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                  <div className="flex items-center space-x-3 overflow-hidden">
                     {item.type === 'note' && <FileText className="h-5 w-5 text-blue-500 shrink-0"/>}
                     {item.type === 'video' && <Video className="h-5 w-5 text-red-500 shrink-0"/>}
                     {item.type === 'audio' && <Mic className="h-5 w-5 text-green-500 shrink-0"/>}
                     {item.type === 'file' && <FileText className="h-5 w-5 text-gray-500 shrink-0"/>} {/* Generic file icon */}
                     <div className="flex flex-col overflow-hidden">
                       <span className="font-medium truncate">{item.name}</span>
                       <span className="text-xs text-muted-foreground">
                           {item.createdAt.toLocaleDateString()}
                           {item.size && ` - ${(item.size / (1024*1024)).toFixed(2)} MB`}
                       </span>
                     </div>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                     <Button variant="ghost" size="icon" onClick={() => handleViewItem(item)} title="View/Decrypt">
                       {viewingItem?.id === item.id && decryptedContent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-destructive hover:text-destructive" title="Delete">
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-8">Your vault is empty. Click "Add New Item" to secure your first note or file.</p>
          )}
        </CardContent>
      </Card>

      {/* Viewing Pane */}
       {viewingItem && (
           <Card className="mt-6 fixed bottom-4 right-4 w-full max-w-md z-50 shadow-xl border-primary animate-in slide-in-from-bottom-5">
             <CardHeader className="flex flex-row items-center justify-between">
                 <div className="flex items-center space-x-2 overflow-hidden">
                      {viewingItem.type === 'note' && <FileText className="h-5 w-5 text-blue-500 shrink-0"/>}
                      {viewingItem.type === 'video' && <Video className="h-5 w-5 text-red-500 shrink-0"/>}
                      {viewingItem.type === 'audio' && <Mic className="h-5 w-5 text-green-500 shrink-0"/>}
                       {viewingItem.type === 'file' && <FileText className="h-5 w-5 text-gray-500 shrink-0"/>}
                     <CardTitle className="text-lg truncate">{viewingItem.name}</CardTitle>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => { setViewingItem(null); setDecryptedContent(null); }}>
                    <EyeOff className="h-5 w-5" />
                     <span className="sr-only">Close Viewer</span>
                 </Button>
             </CardHeader>
             <CardContent className="max-h-60 overflow-y-auto">
                 {isDecrypting ? (
                    <div className="flex items-center justify-center p-4">
                       <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2"/> Decrypting...
                    </div>
                 ) : decryptedContent ? (
                     viewingItem.type === 'note' ? (
                         <pre className="text-sm whitespace-pre-wrap font-sans p-2 bg-muted rounded">{decryptedContent}</pre>
                     ) : (
                         // For files/media, provide a download/view button (mocked)
                         <div className="space-y-2">
                           <p className="text-sm text-muted-foreground">{decryptedContent}</p>
                           <Button size="sm" onClick={() => alert(`Simulating secure access for ${viewingItem.name}`)}>
                               Access Secure Content
                           </Button>
                         </div>
                     )
                 ) : (
                     <p className="text-destructive text-center">Could not load content.</p>
                 )}
             </CardContent>
               <CardFooter className="text-xs text-muted-foreground pt-3 border-t">
                  Created: {viewingItem.createdAt.toLocaleString()}
               </CardFooter>
           </Card>
       )}

    </div>
  );
}
